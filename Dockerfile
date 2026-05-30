FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm run build

FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TRADEJOURNAL_HOST=0.0.0.0
WORKDIR /app
COPY requirements-api.txt .
RUN pip install --no-cache-dir -r requirements-api.txt
COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
RUN mkdir -p /app/db
EXPOSE 8000
CMD ["python", "-m", "backend.main"]

