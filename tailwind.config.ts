import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
    	extend: {
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			mission: {
    				bg: {
    					primary: 'rgb(var(--mission-bg-primary) / <alpha-value>)',
    					secondary: 'rgb(var(--mission-bg-secondary) / <alpha-value>)',
    					tertiary: 'rgb(var(--mission-bg-tertiary) / 0.05)',
    				},
    				border: {
    					DEFAULT: 'rgb(var(--mission-border-default) / 0.2)',
    					subtle: 'rgb(var(--mission-border-subtle) / 0.1)',
    					focus: 'rgb(var(--mission-border-focus) / 0.3)',
    				},
    				text: {
    					primary: 'rgb(var(--mission-text-primary) / 1)',
    					secondary: 'rgb(var(--mission-text-secondary) / 0.8)',
    					muted: 'rgb(var(--mission-text-muted) / 0.6)',
    					subtle: 'rgb(var(--mission-text-subtle) / 0.5)',
    				},
    				status: {
    					assigned: 'rgb(var(--mission-status-assigned) / <alpha-value>)',
    					completed: 'rgb(var(--mission-status-completed) / <alpha-value>)',
    					pending: 'rgb(var(--mission-status-pending) / <alpha-value>)',
    					critical: 'rgb(var(--mission-status-critical) / <alpha-value>)',
    					warning: 'rgb(var(--mission-status-warning) / <alpha-value>)',
    				},
    				action: {
    					accept: 'rgb(var(--mission-action-accept) / <alpha-value>)',
    					'accept-hover': 'rgb(var(--mission-action-accept-hover) / <alpha-value>)',
    					reject: 'rgb(var(--mission-action-reject) / <alpha-value>)',
    					'reject-hover': 'rgb(var(--mission-action-reject-hover) / <alpha-value>)',
    					primary: 'rgb(var(--mission-action-primary) / <alpha-value>)',
    					'primary-hover': 'rgb(var(--mission-action-primary-hover) / <alpha-value>)',
    				},
    				icon: {
    					people: 'rgb(var(--mission-icon-people) / <alpha-value>)',
    					supplies: 'rgb(var(--mission-icon-supplies) / <alpha-value>)',
    					location: 'rgb(var(--mission-icon-location) / <alpha-value>)',
    					default: 'rgb(var(--mission-icon-default) / 0.7)',
    				},
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
