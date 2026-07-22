# Stage 1: Build & Dependencies
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final Non-Root Execution Environment
FROM python:3.11-slim
WORKDIR /app

# Security: Create non-root user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/sh appuser

COPY --chown=appuser:appgroup --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appgroup . .

ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

USER appuser

CMD ["python", "worker.py"]
