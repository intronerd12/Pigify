import gradio as gr
from main import app

# Create a clean status dashboard for the Hugging Face Space UI
with gr.Blocks(title="Pigify AI Vision Backend") as demo:
    gr.Markdown("# 🐷 Pigify AI Vision Backend")
    gr.Markdown(
        "**Status**: Operational & Connected to Supabase Cloud.\n\n"
        "- 📖 **Interactive Swagger API Docs**: [/docs](/docs)\n"
        "- 📑 **ReDoc Documentation**: [/redoc](/redoc)\n"
        "- ⚡ **Inference Endpoint**: `/predict`\n\n"
        "_This Space serves AI lesion detection requests from the Pigify Vercel frontend._"
    )

# Mount the FastAPI app so all API endpoints work seamlessly
app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
