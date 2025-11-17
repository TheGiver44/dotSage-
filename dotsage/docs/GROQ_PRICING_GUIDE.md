# Groq API Pricing Guide for DotSage Testing

## Quick Summary

- **Free Tier**: 30 requests/minute, 14,400 requests/day (no credit card needed)
- **Cost per question**: ~$0.0004 (less than half a cent)
- **Hackathon testing**: ~$0.14 for 350 questions
- **Very affordable** for testing and development

## Detailed Pricing

### Free Tier Limits
- **30 requests per minute** (RPM)
- **14,400 requests per day** (RPD)
- No credit card required
- Available for all models including Llama 3.3 70B

### Model Pricing (Llama 3.3 70B Versatile)
- **Input tokens**: $0.59 per 1M tokens
- **Output tokens**: $0.79 per 1M tokens

### Cost Per Request

Each DotSage question uses approximately:
- System prompt: ~150 tokens
- User question: ~35 tokens (average)
- AI response: ~300 tokens (we limit to 500 max)

**Total**: ~485 tokens per request

**Cost breakdown**:
- Input: 185 tokens × $0.59/1M = $0.00011
- Output: 300 tokens × $0.79/1M = $0.00024
- **Total: ~$0.00035 per question** (less than half a cent)

## Testing Scenarios

### Light Testing (50 questions)
- Cost: **$0.02** (2 cents)
- Well within free tier

### Moderate Testing (500 questions)
- Cost: **$0.20** (20 cents)
- Still within free tier limits

### Heavy Testing (5,000 questions)
- Cost: **$2.00**
- May hit rate limits, but cost is minimal

### Hackathon Testing (350 questions)
- Cost: **$0.14** (14 cents)
- Perfect for demo and screenshots

## Rate Limits

**Free Tier**:
- 30 questions per minute = More than enough for manual testing
- 14,400 questions per day = Sufficient for extensive testing

If you hit limits:
- Wait 1 minute for RPM limit to reset
- Upgrade to paid tier ($9.99/month) for higher limits
- Use multiple API keys for parallel testing

## Monitoring Usage

1. Visit: https://console.groq.com/
2. Check usage dashboard for requests, tokens, and costs
3. Monitor rate limit status

## Cost Comparison

| Provider | Model | Cost per 1K tokens | Free Tier |
|----------|-------|-------------------|-----------|
| **Groq** | Llama 3.3 70B | ~$0.0004 | ✅ Yes (30 RPM) |
| OpenAI | GPT-4 | ~$0.03-0.06 | ❌ No |
| OpenAI | GPT-3.5 | ~$0.002 | ❌ No |

**Groq is significantly cheaper** and offers a free tier!

## Getting Started

1. Sign up: https://console.groq.com/
2. Get API key (free, no credit card)
3. Set in `.env`: `GROQ_API_KEY=your_key_here`
4. Start testing!

## Bottom Line

- Free tier covers all testing needs
- Cost per question: less than half a cent
- Hackathon testing: ~14 cents for 350 questions
- Production scale: ~$12/month for 30K questions

**Conclusion**: Groq is extremely cost-effective. The free tier should cover all your testing needs!
