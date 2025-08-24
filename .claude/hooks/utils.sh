#!/usr/bin/env bash

# Shared utilities for Claude Code git hooks
# This script provides common functions used by other hooks

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[CLAUDE-GIT]${NC} $1" >&2
}

log_success() {
    echo -e "${GREEN}[CLAUDE-GIT]✓${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[CLAUDE-GIT]⚠${NC} $1" >&2
}

log_error() {
    echo -e "${RED}[CLAUDE-GIT]✗${NC} $1" >&2
}

# Get git root directory
get_git_root() {
    git rev-parse --show-toplevel 2>/dev/null || {
        log_error "Not in a git repository"
        exit 1
    }
}

# Check if we're in a git repository
is_git_repo() {
    git rev-parse --git-dir >/dev/null 2>&1
}

# Get current branch name
get_current_branch() {
    git rev-parse --abbrev-ref HEAD
}

# Check if branch is protected
is_protected_branch() {
    local branch="$1"
    local protected_branches=("main" "master" "develop" "deployement-branch")
    
    for protected in "${protected_branches[@]}"; do
        if [[ "$branch" == "$protected" ]]; then
            return 0
        fi
    done
    return 1
}

# Get Claude task name from environment or default
get_claude_task_name() {
    if [[ -n "${CLAUDE_TASK:-}" ]]; then
        echo "$CLAUDE_TASK"
    elif [[ -n "${CLAUDE_SESSION_DESCRIPTION:-}" ]]; then
        echo "$CLAUDE_SESSION_DESCRIPTION"
    else
        echo "claude-development-$(date +%Y%m%d-%H%M%S)"
    fi
}

# Sanitize string for branch name
sanitize_for_branch() {
    local str="$1"
    # Convert to lowercase, replace spaces with hyphens, remove special chars
    echo "$str" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g' | sed 's/--*/-/g' | sed 's/^-//g' | sed 's/-$//g'
}

# Load configuration
load_config() {
    local config_file="$(get_git_root)/.claude/settings.json"
    if [[ -f "$config_file" ]]; then
        # Simple JSON parsing for basic values
        local auto_commit=$(grep '"autoCommit":' "$config_file" | sed 's/.*"autoCommit":\s*\([^,]*\).*/\1/' | tr -d ' ')
        local dry_run=$(grep '"dryRun":' "$config_file" | sed 's/.*"dryRun":\s*\([^,]*\).*/\1/' | tr -d ' ')
        
        echo "AUTO_COMMIT=${auto_commit:-true}"
        echo "DRY_RUN=${dry_run:-false}"
    else
        echo "AUTO_COMMIT=true"
        echo "DRY_RUN=false"
    fi
}

# Check if there are changes to commit
has_changes() {
    ! git diff --quiet || ! git diff --cached --quiet || [[ -n $(git ls-files --others --exclude-standard) ]]
}

# Get staged and unstaged changes summary
get_changes_summary() {
    local changes=""
    
    # Get list of changed files
    local changed_files=$(git diff --name-only 2>/dev/null || true)
    local staged_files=$(git diff --cached --name-only 2>/dev/null || true)
    local new_files=$(git ls-files --others --exclude-standard 2>/dev/null || true)
    
    # Build summary
    local all_files=""
    [[ -n "$changed_files" ]] && all_files+="$changed_files"
    [[ -n "$staged_files" ]] && all_files+="$staged_files"
    [[ -n "$new_files" ]] && all_files+="$new_files"
    
    if [[ -n "$all_files" ]]; then
        # Get unique files and count by extension
        local unique_files=$(echo "$all_files" | tr ' ' '\n' | sort -u)
        local file_count=$(echo "$unique_files" | wc -l)
        
        if [[ $file_count -eq 1 ]]; then
            changes="$(basename "$unique_files")"
        else
            changes="$file_count files updated"
        fi
    else
        changes="minor changes"
    fi
    
    echo "$changes"
}

# Generate commit message
generate_commit_message() {
    local task_name="$1"
    local changes_summary="$2"
    
    # Truncate task name if too long
    local short_task=$(echo "$task_name" | cut -c1-50)
    
    echo "feat: $short_task - $changes_summary"
}

# Export functions for use in other scripts
case "${BASH_SOURCE[0]}" in
    */utils.sh)
        # Allow sourcing this file
        ;;
    *)
        # Prevent direct execution
        log_error "This script should be sourced, not executed directly"
        exit 1
        ;;
esac