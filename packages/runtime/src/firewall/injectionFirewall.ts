export type FirewallVerdict = {
  safe: boolean;
  confidence: number;       // 0.0 – 1.0
  reason?: string;          // populated when safe=false
  flaggedPatterns?: string[]; // specific suspicious fragments
};

export interface InjectionFirewall {
  screen(input: string, context?: FirewallContext): Promise<FirewallVerdict>;
}

export type FirewallContext = {
  skillName: string;
  requestedScopes: string[];
};
