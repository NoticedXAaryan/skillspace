"use client"
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';

interface LightningProps {
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
}

const Lightning: React.FC<LightningProps> = ({
  hue = 195,
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Accessibility check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      
      #define OCTAVE_COUNT 10

      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          uv.x += uXOffset;
          
          uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
          
          float dist = abs(uv.x);
          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
          vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
          col = pow(col, vec3(1.0));
          fragColor = vec4(col, 1.0);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const uHueLocation = gl.getUniformLocation(program, "uHue");
    const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
    const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
    const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
    const uSizeLocation = gl.getUniformLocation(program, "uSize");

    const startTime = performance.now();
    let animationFrameId: number;

    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
      const currentTime = performance.now();
      gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
      gl.uniform1f(uHueLocation, hue);
      gl.uniform1f(uXOffsetLocation, xOffset);
      gl.uniform1f(uSpeedLocation, speed);
      gl.uniform1f(uIntensityLocation, intensity);
      gl.uniform1f(uSizeLocation, size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return <canvas ref={canvasRef} className="w-full h-full relative" style={{ willChange: 'transform', contain: 'strict' }} />;
};

interface HeroSectionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  badge?: { text: string };
  installCmd?: string;
  cta?: React.ReactNode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  title, 
  subtitle, 
  align = 'center', 
  badge, 
  installCmd: propInstallCmd,
  cta
}) => {
  const [copied, setCopied] = useState(false);
  const isHomePage = !title;
  
  const defaultTitle = "The registry for AI skills.";
  const defaultSubtitle = (
    <>
      Install, run, and publish reusable AI capabilities —<br className="hidden md:block" />
      the same way you&apos;d manage any other dependency.
    </>
  );
  const defaultBadge = { text: "v0.1.0 · Open Source · MIT License" };
  const defaultInstallCmd = "npx skillspace install @core/summary";

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;
  const displayBadge = badge || (isHomePage ? defaultBadge : undefined);
  const installCmd = propInstallCmd !== undefined ? propInstallCmd : (isHomePage ? defaultInstallCmd : undefined);

  const handleCopy = () => {
    if (!installCmd) return;
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={`relative w-full bg-black text-white overflow-hidden border-b border-white/10 mt-0 ${isHomePage ? 'h-[80vh] min-h-[600px]' : 'py-24'}`}>
      <div className={`relative z-20 w-full h-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-center ${align === 'center' ? 'items-center' : 'items-start'}`}>
        
        {/* Main hero content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`relative z-30 flex flex-col ${align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left'} max-w-4xl pointer-events-auto`}
        >            
          {displayBadge && (
            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-neutral-400 mb-8"
            >
              {isHomePage ? (
                <>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>{displayBadge.text}</span>
                </>
              ) : (
                <span className="text-cyan-400 font-bold uppercase tracking-widest">{displayBadge.text}</span>
              )}
            </motion.div>
          )}

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight"
          >
            {displayTitle}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-neutral-400 mb-10 max-w-2xl text-lg md:text-xl font-sans font-normal"
          >
            {displaySubtitle}
          </motion.p>

          {(installCmd || cta || isHomePage) && (
            <motion.div variants={itemVariants} className={`flex flex-col sm:flex-row gap-4 z-40 ${align === 'center' ? 'items-center' : 'items-start'}`}>
              {installCmd && (
                <div className="relative flex items-center group">
                  <div className="flex items-center bg-neutral-900 border border-white/10 rounded-md pl-4 pr-12 py-3 font-mono text-sm text-cyan-400 shadow-xl transition-colors hover:border-cyan-500/30">
                    <span className="text-neutral-500 mr-2">$</span>
                    {installCmd}
                  </div>
                  <button
                    onClick={handleCopy}
                    aria-label="Copy install command"
                    className="absolute right-2 p-1.5 text-neutral-400 hover:text-white transition-colors rounded-md hover:bg-white/10"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
              
              {cta ? cta : (isHomePage ? (
                <Link 
                  href="/packages"
                  className="flex items-center px-6 py-3 text-neutral-300 font-medium rounded-md hover:text-white transition-colors"
                >
                  Browse Registry <span className="ml-2">→</span>
                </Link>
              ) : null)}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black"></div>

        <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-cyan-500/10 to-transparent blur-[100px]"></div>

        <div className="absolute top-0 w-[100%] left-1/2 transform -translate-x-1/2 h-full hidden md:block">
          <Lightning
            hue={195}
            xOffset={0}
            speed={1.2}
            intensity={0.5}
            size={2}
          />
        </div>

        {/* Mobile static fallback */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black md:hidden"></div>
      </motion.div>
    </div>
  );
};
