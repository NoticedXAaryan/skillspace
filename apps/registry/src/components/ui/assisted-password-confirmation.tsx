"use client"

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AssistedPasswordConfirmation({
  password, 
  onMatch
}: {
  password: string, 
  onMatch?: (matches: boolean) => void
}) {
  const [confirmPassword, setConfirmPassword] = useState('')
  const [shake, setShake] = useState(false)

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (
      confirmPassword.length >= password.length &&
      e.target.value.length > confirmPassword.length
    ) {
      setShake(true)
    } else {
      setConfirmPassword(e.target.value)
    }
  }

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(timer)
    }
  }, [shake])

  const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    if (onMatch) {
      onMatch(passwordsMatch);
    }
  }, [passwordsMatch, onMatch]);

  const getLetterStatus = (letter: string, index: number) => {
    if (!confirmPassword[index]) return ''
    return confirmPassword[index] === letter
      ? 'bg-green-500/20'
      : 'bg-red-500/20'
  }

  const bounceAnimation = {
    x: shake ? [-10, 10, -10, 10, 0] : 0,
    transition: { duration: 0.5 },
  }

  const matchAnimation = {
    scale: passwordsMatch ? [1, 1.02, 1] : 1,
    transition: { duration: 0.3 },
  }

  const borderAnimation = {
    borderColor: passwordsMatch ? '#10B981' : '',
    transition: { duration: 0.3 },
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative flex w-full flex-col items-start justify-center gap-2">
        <label className="text-sm font-medium leading-none text-foreground">Confirm Password</label>
        
        {/* Visual password representation */}
        <motion.div
          className="h-[52px] w-full rounded-xl border border-input bg-background px-2 py-2 shadow-sm"
          animate={{
            ...bounceAnimation,
            ...matchAnimation,
            ...borderAnimation,
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <div className="z-10 flex h-full items-center justify-start bg-transparent px-2 tracking-[0.15em]">
              {password.split('').map((_, index) => (
                <div
                  key={index}
                  className="flex h-full w-4 shrink-0 items-center justify-center"
                >
                  <span className="size-[5px] rounded-full bg-foreground/50"></span>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-2 top-0 z-0 flex h-full w-full items-center justify-start">
              {password.split('').map((letter, index) => (
                <motion.div
                  key={index}
                  className={`ease absolute h-full w-4 transition-all duration-300 ${getLetterStatus(
                    letter,
                    index,
                  )}`}
                  style={{
                    left: `${index * 16}px`,
                    scaleX: confirmPassword[index] ? 1 : 0,
                    transformOrigin: 'left',
                  }}
                ></motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Input field */}
        <motion.div
          className="h-[52px] w-full overflow-hidden rounded-xl"
          animate={matchAnimation}
        >
          <motion.input
            className="h-full w-full rounded-xl border border-input bg-background px-3.5 py-3 tracking-[0.4em] outline-none placeholder:tracking-normal focus:border-ring text-foreground shadow-sm transition-colors"
            type="password"
            placeholder="Re-type password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            animate={borderAnimation}
          />
        </motion.div>
      </div>
    </div>
  )
}
