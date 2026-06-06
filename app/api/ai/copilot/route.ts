import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

const supabase = createSupabaseServer();

function extractBudget(message: string) {
	const match = message.match(/\$?([\d,]+(?:\.\d{1,2})?)/);
	if (!match) return null;
	return Number(match[1].replace(/,/g, ''));
}

function extractTitle(message: string) {
	const words = message.replace(/create|make|new|rfq|for|budget|usd|dollars|dollar|laptops?/gi, '').trim();
	return words || 'New RFQ';
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const message = String(body.message || '').trim();
		if (!message) {
			return NextResponse.json({ error: 'message is required' }, { status: 400 });
		}

		const lower = message.toLowerCase();
		let response = {
			message: "I can help with that.",
			action: null as null | { type: string; data: Record<string, unknown> },
			suggestions: ['Add more detail', 'Specify vendor or deadline'],
		};

		if (lower.includes('rfq')) {
			response = {
				message: "I'll create that RFQ for you. Here's what I've prepared:",
				action: {
					type: 'create_rfq',
					data: {
						title: extractTitle(message),
						budget: extractBudget(message),
						category: lower.includes('laptop') || lower.includes('computer') ? 'IT Equipment' : 'General Procurement',
					},
				},
				suggestions: ['Add delivery deadline', 'Specify brand preference'],
			};
		} else if (lower.includes('vendor')) {
			response = {
				message: 'I can help review vendor quality and trust score.',
				action: {
					type: 'review_vendor',
					data: { vendor_id: body.context?.vendor_id || null },
				},
				suggestions: ['Share vendor name', 'Provide org context'],
			};
		} else if (lower.includes('quote')) {
			response = {
				message: 'I can compare quotations and highlight the best option.',
				action: {
					type: 'compare_quotes',
					data: { rfq_id: body.context?.rfq_id || null },
				},
				suggestions: ['Include the RFQ id', 'Ask for risk flags'],
			};
		}

		if (body.context?.org_id) {
			await supabase.from('activities').insert([{ title: `Copilot request: ${message.slice(0, 100)}`, org_id: body.context.org_id }]);
		}

		return NextResponse.json(response);
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

