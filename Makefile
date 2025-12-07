.PHONY: run
run: install
	@echo "Запуск приложения..."
	npm run dev

install:
	@echo "Установка зависимостей..."
	npm install

build: install
	@echo "Сборка приложения..."
	npm run build

preview: install build
	@echo "Просмотр сборки..."
	npx vite preview
