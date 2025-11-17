.PHONY: run
run: install
	@echo "Запуск приложения..."
	npm run dev

install:
	@echo "Установка зависимостей..."
	npm install