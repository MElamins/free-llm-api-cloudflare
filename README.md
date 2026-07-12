Harika! 🎯 İşte doğrudan GitHub editörüne yapıştırabileceğin **tam ve hazır README.md** içeriği:

---

```markdown
# 🚀 Free LLM API with Cloudflare Workers

[![GitHub stars](https://img.shields.io/github/stars/MElamins/free-llm-api-cloudflare)](https://github.com/MElamins/free-llm-api-cloudflare/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/MElamins/free-llm-api-cloudflare)](https://github.com/MElamins/free-llm-api-cloudflare/network)
[![GitHub license](https://img.shields.io/github/license/MElamins/free-llm-api-cloudflare)](https://github.com/MElamins/free-llm-api-cloudflare/blob/main/LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)

---

**Deploy your own FREE AI text generation API in 5 minutes!** ⚡

This project provides a **production-ready API** for text generation using Cloudflare Workers AI. It supports **Meta Llama, Qwen, GLM**, and more - all with **10,000 free daily requests**. Perfect for chatbots, content creation, code assistants, and AI applications.

---

## ✨ Features

| Feature | Benefit |
|---------|---------|
| 🆓 **Zero Cost** | Free tier with 10,000 neurons/day |
| ⚡ **Global CDN** | Lightning-fast responses worldwide |
| 🔐 **Secure** | API key authentication built-in |
| 🧠 **Latest Models** | Llama 4, Llama 3.3 70B, Qwen, GLM |
| 🛠️ **Ready to Use** | No ML expertise required |
| 🌐 **CORS Enabled** | Use from any frontend |
| 📦 **Lightweight** | Simple and maintainable code |

---

## 🎯 Use Cases

- 🤖 **Chatbots & Virtual Assistants**
- 📝 **Content Generation** (articles, blogs, social media)
- 💻 **Code Assistant** (debugging, explanations, code generation)
- 📚 **Educational Tools** (tutoring, Q&A)
- 🌍 **Multilingual Applications**
- 🔍 **Search & Analysis**

---

## 🧠 Supported AI Models

| Model | Provider | Best For |
|-------|----------|----------|
| **Llama 4 Scout** | Meta | General purpose, coding, chat |
| **Llama 3.3 70B** | Meta | Complex reasoning, analysis |
| **Qwen 3 30B** | Alibaba | Multilingual, coding |
| **GLM 4.7 Flash** | Zhipu AI | Fast responses, real-time chat |

---

## 📊 Free Tier Details

| Plan | Daily Neurons | Monthly | Cost |
|------|--------------|---------|------|
| **Free** | 10,000 | 300,000 | **$0** |
| **Pro** | Usage-based | Custom | $0.011/1k neurons |

> 💡 **Tip:** 10,000 neurons/day = ~200-500 API calls depending on model size

---

## 🚀 Quick Start

### Prerequisites
- [Cloudflare Account](https://dash.cloudflare.com/sign-up) (free)
- 5 minutes of your time

### Setup Steps

#### 1. Create Cloudflare Account
Sign up at [Cloudflare](https://dash.cloudflare.com/) for free.

#### 2. Create a Worker
- Go to Cloudflare Dashboard > Workers & Pages
- Click **"Create application"**
- Select **"Create Worker"**
- Name it (e.g., `free-llm-api`)
- Click **"Deploy"**

#### 3. Add Worker Code
- Replace the default code with the code from this repo
- Click **"Save and Deploy"**

#### 4. Add API Key
- Go to **Settings** > **Variables**
- Click **"Add variable"**
  - Variable name: `API_KEY`
  - Value: `your-secret-key`
- Click **"Save and Deploy"**

#### 5. Enable Workers AI
- Go to **AI** section
- Click **"Get started"**
- Enable Workers AI (free tier)

#### 6. Add AI Binding (CRITICAL)
- In worker settings, go to **Variables**
- Scroll to **"Service bindings"**
- Click **"Add binding"**
  - Variable: `AI`
  - Service: **Workers AI**
- Click **"Save and Deploy"**

> ⚠️ **Warning:** Without AI binding, the worker won't work!

#### 7. Get Your URL
- Your worker URL: `https://free-llm-api.your-subdomain.workers.dev`
- Save this for API access

---

## 💻 API Usage Examples

### Python
```python
import requests

def generate_text(prompt):
    response = requests.post(
        "https://your-worker-name.workers.dev/",
        headers={
            "Authorization": "Bearer your-api-key",
            "Content-Type": "application/json"
        },
        json={"prompt": prompt}
    )
    return response.json()

# Example
result = generate_text("Explain quantum computing simply")
print(result['response'])
```

### cURL
```bash
curl -X POST https://your-worker-name.workers.dev/ \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is the capital of Turkey?"}'
```

### JavaScript
```javascript
const response = await fetch("https://your-worker-name.workers.dev/", {
    method: "POST",
    headers: {
        "Authorization": "Bearer your-api-key",
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: "Write a poem about AI" })
});
const data = await response.json();
console.log(data.response);
```

---

## 🔧 Customization

### Change AI Model
```javascript
// Replace this line in worker.js
"@cf/meta/llama-4-scout-17b-16e-instruct"

// With any model:
// "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
// "@cf/qwen/qwen3-30b-a3b-fp8"
// "@cf/zai-org/glm-4.7-flash"
```

### Adjust Parameters
```javascript
const result = await env.AI.run("model-id", {
    prompt: prompt,
    max_tokens: 1000,      // Response length (1-2048)
    temperature: 0.8,      // Creativity (0.0-1.0)
    top_p: 0.9            // Nucleus sampling
});
```

---

## 🔧 worker.js (Full Code)

```javascript
export default {
    async fetch(request, env) {
        const API_KEY = env.API_KEY;
        const url = new URL(request.url);
        const auth = request.headers.get("Authorization");

        // 🔐 API key check
        if (auth !== `Bearer ${API_KEY}`) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }

        // 🚫 Only allow POST
        if (request.method !== "POST" || url.pathname !== "/") {
            return jsonResponse({ error: "Not allowed" }, 405);
        }

        try {
            const { prompt } = await request.json();

            if (!prompt || prompt.trim() === "") {
                return jsonResponse({ error: "Prompt is required" }, 400);
            }

            // 🧠 Generate text
            const result = await env.AI.run(
                "@cf/meta/llama-4-scout-17b-16e-instruct",
                {
                    prompt: prompt,
                    max_tokens: 500,
                    temperature: 0.7
                }
            );

            return jsonResponse({
                success: true,
                response: result,
                prompt: prompt
            }, 200);

        } catch (err) {
            return jsonResponse({
                error: "Failed to generate response",
                details: err.message
            }, 500);
        }
    },
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
    });
}
```

---

## ❓ Common Issues

**"Unauthorized" error**
- Verify API_KEY is set correctly
- Check `Bearer ` prefix in Authorization header

**"Model not found" error**
- Verify model ID is correct
- Check [Cloudflare Models](https://developers.cloudflare.com/workers-ai/models/)
- Ensure Workers AI is enabled

**JSON parsing error**
- Verify AI binding is properly configured
- Restart the worker

**Cold start delay**
- First request may take 5-10 seconds
- Subsequent requests are instant

---

## 📦 Repository Structure

```
/
├── README.md          # This file
├── worker.js          # Cloudflare Worker code
└── frontend_demo.html # Optional demo interface
```

---

## 📄 License

MIT License - Free for personal and commercial use.

---

## ⭐ Support the Project

If this project helped you:
- ⭐ Star it on GitHub
- 🐦 Share it on Twitter/X
- 📝 Write a blog post about it

---

## 🏷️ Topics

`api` `ai` `llm` `cloudflare` `text-generation` `free-api` `meta-llama` `qwen` `workers-ai` `chatbot` `code-assistant` `content-generation` `nlp` `machine-learning` `serverless`

---

**Made with ❤️ by MElamins**
