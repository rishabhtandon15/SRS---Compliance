# Use lightweight Python 3.11 image
FROM python:3.11-slim

# Create user with UID 1000 required by Hugging Face Spaces
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

# Switch to root temporarily for dependencies installation
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

USER user

# Install Python requirements
COPY --chown=user:user requirements.txt api/requirements_api.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt -r requirements_api.txt

# Copy backend files and pre-built frontend
COPY --chown=user:user src/ ./src/
COPY --chown=user:user data/ ./data/
COPY --chown=user:user api/ ./api/
COPY --chown=user:user main.py ./
COPY --chown=user:user frontend/dist ./frontend/dist

# Hugging Face Spaces listens on port 7860
EXPOSE 7860

CMD ["python", "-m", "uvicorn", "api.server_prod:app", "--host", "0.0.0.0", "--port", "7860"]
