FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    libxshmfence1 \
    libxdamage1 \
    libxcomposite1 \
    libxrandr2 \
    libxfixes3 \
    libxext6 \
    libx11-6 \
    libxcb1 \
    libx11-xcb1 \
    libcups2 \
    libatk1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    fonts-liberation \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN playwright install chromium

COPY . .

EXPOSE 8001

CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8001"]