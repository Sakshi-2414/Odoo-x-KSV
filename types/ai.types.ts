// ai.types.ts

export interface AIAnalysis {
	strengths?: string[];
	risks?: string[];
	recommendation?: string;
	[key: string]: any;
}

export interface AISummary {
	ai_score?: number;
	ai_analysis?: AIAnalysis;
}

export interface AIRecommendation {
	id?: string;
	title?: string;
	description?: string;
	confidence?: number; // 0-100
	meta?: Record<string, any>;
}
