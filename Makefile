.PHONY: install test lint run-baseline run-llm train-dqn ready run-ingress help

# Variables
PYTHON = python3
PIP = $(PYTHON) -m pip
PYTEST = $(PYTHON) -m pytest
MAIN_SCRIPT = baseline_inference.py
VALIDATE_SCRIPT = validate.py

help:
	@echo "Cloud Cost Optimizer - Industry Ready Workflow"
	@echo "---------------------------------------------"
	@echo "install         Install dependencies"
	@echo "test            Run all unit and integration tests"
	@echo "lint            Lint the codebase using flake8 and black"
	@echo "validate        Validate OpenEnv interface compliance"
	@echo "run-baseline    Run baseline heuristic agents (Threshold, Predictive)"
	@echo "run-llm         Run the LLM-based agent (requires API key in .env)"
	@echo "train-dqn       Train the Deep Q-Network agent"
	@echo "clean           Remove temporary files and cache"

install:
	$(PIP) install -r requirements.txt

test:
	$(PYTEST) tests/ -v --cov=env --cov=agent --cov-report=term-missing

lint:
	$(PIP) install flake8 black isort
	flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	black . --check
	isort . --check-only

validate:
	$(PYTHON) $(VALIDATE_SCRIPT)

run-baseline:
	$(PYTHON) agent/evaluate.py

run-llm:
	$(PYTHON) $(MAIN_SCRIPT) --model meta/llama-3.1-70b-instruct

ready: lint validate test run-baseline
	@echo "✅ Project is industry-ready and fully validated!"

run-ingress:
	$(PYTHON) scripts/ingress_server.py

train-dqn:
	$(PYTHON) agent/train.py --task steady --algo dqn --steps 100000

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .coverage htmlcov
