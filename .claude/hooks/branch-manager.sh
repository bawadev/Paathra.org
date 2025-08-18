#!/usr/bin/env bash

# Branch Manager for Claude Code
# Handles automatic branch creation for claude-development tasks

set -euo pipefail

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

# Configuration
BRANCH_PREFIX="claude-development"

# Main function
main() {
    local action="$1"
    
    case "$action" in
        "start")
            handle_session_start
            ;;
        "cleanup")
            handle_cleanup
            ;;
        *)
            log_error "Unknown action: $action"
            exit 1
            ;;
    esac
}

# Handle session start - check if we need to create a new branch
handle_session_start() {
    log "Checking branch requirements..."
    
    # Check if we're in a git repository
    if ! is_git_repo; then
        log_warning "Not in a git repository, skipping branch management"
        return 0
    fi
    
    local current_branch=$(get_current_branch)
    local task_name=$(get_claude_task_name)
    
    log "Current branch: $current_branch"
    log "Task name: $task_name"
    
    # Check if task starts with claude-development
    if [[ "$task_name" =~ ^claude-development ]]; then
        create_claude_branch "$task_name"
    else
        log "Task doesn't require new branch"
    fi
}

# Create a new branch for claude development
create_claude_branch() {
    local task_name="$1"
    
    # Sanitize task name for branch
    local sanitized_name=$(sanitize_for_branch "$task_name")
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local branch_name="${BRANCH_PREFIX}-${timestamp}-${sanitized_name}"
    
    # Truncate if too long (git branch limit is ~250 chars)
    if [[ ${#branch_name} -gt 100 ]]; then
        branch_name="${branch_name:0:100}"
    fi
    
    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        log_warning "Branch $branch_name already exists, switching to it"
        git checkout "$branch_name"
        return 0
    fi
    
    # Check if we're on a protected branch
    local current_branch=$(get_current_branch)
    if is_protected_branch "$current_branch"; then
        log "Creating new branch from protected branch: $current_branch"
        git checkout -b "$branch_name"
        log_success "Created and switched to branch: $branch_name"
    else
        log "Already on feature branch: $current_branch"
        log "Creating new branch from current: $branch_name"
        git checkout -b "$branch_name"
    fi
    
    # Store branch info for later reference
    echo "$branch_name" > ".claude/current-branch"
    log_success "Ready for development on branch: $branch_name"
}

# Handle cleanup when session ends
handle_cleanup() {
    log "Cleaning up branch management..."
    
    if [[ -f ".claude/current-branch" ]]; then
        local branch_name=$(cat ".claude/current-branch")
        rm -f ".claude/current-branch"
        
        # Check if branch has any commits
        if [[ -n $(git log --oneline "$branch_name" ^$(git merge-base "$branch_name" HEAD) 2>/dev/null || true) ]]; then
            log "Branch $branch_name has commits, keeping it"
        else
            log "Branch $branch_name has no commits, consider cleanup"
        fi
    fi
}

# Check if we should create a new branch
should_create_branch() {
    local task_name="$1"
    
    # Check if task starts with claude-development
    if [[ "$task_name" =~ ^claude-development ]]; then
        return 0
    fi
    
    return 1
}

# Validate branch name
validate_branch_name() {
    local branch="$1"
    
    # Basic validation
    if [[ -z "$branch" ]]; then
        log_error "Branch name cannot be empty"
        return 1
    fi
    
    # Check for invalid characters
    if [[ "$branch" =~ [^a-zA-Z0-9._/-] ]]; then
        log_error "Branch contains invalid characters"
        return 1
    fi
    
    return 0
}

# Run main function with all arguments
main "$@"