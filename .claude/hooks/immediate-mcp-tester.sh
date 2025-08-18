#!/usr/bin/env bash

# Immediate Playwright MCP Testing
# Tests current implementation immediately via MCP before writing formal tests

set -euo pipefail

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

# Configuration
SERVER_URL="http://localhost:3000"
MAX_RETRIES=3
RETRY_DELAY=2

main() {
    local task_name="${CLAUDE_TASK:-$(get_claude_task_name)}"
    log "Starting immediate MCP testing for: $task_name"
    
    # Determine test target based on task
    local test_target=$(determine_test_target "$task_name")
    
    # Run immediate MCP tests
    run_immediate_tests "$test_target" "$task_name"
    
    # Handle test results
    handle_test_results "$test_target"
}

determine_test_target() {
    local task="$1"
    
    # Map task keywords to test targets
    case "$task" in
        *login*|*auth*)
            echo "/auth/login"
            ;;
        *profile*|*user*)
            echo "/profile"
            ;;
        *donate*|*booking*)
            echo "/donate"
            ;;
        *manage*|*admin*)
            echo "/manage"
            ;;
        *register*|*signup*)
            echo "/auth/register"
            ;;
        *)
            echo "/"
            ;;
    esac
}

run_immediate_tests() {
    local target="$1"
    local task="$2"
    
    log "Testing target: $target"
    
    # Ensure server is running
    ensure_server_running
    
    # Run sequential immediate tests
    run_stage_1_basic "$target" || return 1
    run_stage_2_elements "$target" || return 1
    run_stage_3_interactions "$target" || return 1
    
    log_success "All immediate tests passed for: $target"
    return 0
}

ensure_server_running() {
    if ! curl -s "$SERVER_URL" >/dev/null 2&>1; then
        log_warning "Server not running, starting..."
        start_server
    fi
}

start_server() {
    log "Starting development server..."
    nohup npm run dev > /tmp/server.log 2&>1 &
    local server_pid=$!
    
    # Wait for server to be ready
    local attempts=0
    while [[ $attempts -lt 30 ]]; do
        if curl -s "$SERVER_URL" >/dev/null 2&>1; then
            log_success "Server ready on $SERVER_URL"
            return 0
        fi
        sleep 1
        ((attempts++))
    done
    
    log_error "Server failed to start"
    return 1
}

run_stage_1_basic() {
    local target="$1"
    log "Stage 1: Basic page load test"
    
    # Test basic page load via MCP
    local page_load=$(mcp_playwright_test "$target" "basic-load")
    
    if [[ "$page_load" != *"success"* ]]; then
        log_error "Stage 1 FAILED: Page load failed"
        return 1
    fi
    
    log_success "Stage 1 PASSED: Page loads successfully"
    return 0
}

run_stage_2_elements() {
    local target="$1"
    log "Stage 2: Element presence test"
    
    # Test critical elements via MCP
    local elements=$(mcp_playwright_analyze_elements "$target")
    
    local required_elements=(
        "[data-testid="
        "button"
        "form"
        "input"
    )
    
    for element in "${required_elements[@]}"; do
        if [[ "$elements" != *"$element"* ]]; then
            log_error "Stage 2 FAILED: Missing element: $element"
            return 1
        fi
    done
    
    log_success "Stage 2 PASSED: All required elements present"
    return 0
}

run_stage_3_interactions() {
    local target="$1"
    log "Stage 3: Basic interaction test"
    
    # Test basic interactions via MCP
    local interaction_result=$(mcp_playwright_test_interactions "$target")
    
    if [[ "$interaction_result" != *"success"* ]]; then
        log_error "Stage 3 FAILED: Basic interactions failed"
        return 1
    fi
    
    log_success "Stage 3 PASSED: Basic interactions work"
    return 0
}

# MCP wrapper functions for immediate testing
mcp_playwright_test() {
    local url="$1"
    local test_type="$2"
    
    case "$test_type" in
        "basic-load")
            echo "mcp_playwright.navigate({ url: '$url' })"
            echo "mcp_playwright.evaluate({ script: 'document.readyState' })"
            ;;
        "console-errors")
            echo "mcp_playwright.console({ filter: ['error'] })"
            ;;
        "elements")
            echo "mcp_playwright.evaluate({ script: 'document.querySelectorAll(\"[data-testid]\").length' })"
            ;;
    esac
}

mcp_playwright_analyze_elements() {
    local url="$1"
    echo "mcp_playwright.evaluate({ script: 'document.documentElement.outerHTML' })"
}

mcp_playwright_test_interactions() {
    local url="$1"
    echo "mcp_playwright.evaluate({ script: 'document.querySelectorAll(\"button, input\").length' })"
}

handle_test_results() {
    local target="$1"
    local test_result=$?
    
    if [[ $test_result -eq 0 ]]; then
        log_success "Immediate MCP tests passed for: $target"
        
        # Only proceed to formal test writing if immediate tests pass
        log "Implementation validated - ready for formal test generation"
    else
        log_error "Immediate MCP tests failed - fixing required"
        
        # Trigger immediate fix detection
        "$SCRIPT_DIR/mcp-fix-detector.sh" "$target"
        
        # Exit with failure to prevent advancement
        exit 1
    fi
}

# Usage
case "${1:-}" in
    "test")
        main
        ;;
    "help")
        echo "Usage: $0 [test|help]"
        echo "Runs immediate MCP tests on current implementation"
        ;;
    *)
        main
        ;;
esac