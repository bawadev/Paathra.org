#!/usr/bin/env bash

# Auto-Commit Script for Claude Code
# Automatically commits changes after successful task completion

set -euo pipefail

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

# Configuration
COMMIT_TEMPLATE="feat: {task_name} - {change_summary}"
DRY_RUN=false

# Main function
main() {
    log "Starting auto-commit process..."
    
    # Check if we're in a git repository
    if ! is_git_repo; then
        log_warning "Not in a git repository, skipping auto-commit"
        return 0
    fi
    
    # Load configuration
    load_config
    
    # Check if auto-commit is enabled
    if [[ "${AUTO_COMMIT:-true}" != "true" ]]; then
        log "Auto-commit disabled by configuration"
        return 0
    fi
    
    # Get current branch and task info
    local current_branch=$(get_current_branch)
    local task_name=$(get_claude_task_name)
    
    log "Current branch: $current_branch"
    log "Task: $task_name"
    
    # Check if we're on a protected branch
    if is_protected_branch "$current_branch"; then
        log_warning "On protected branch ($current_branch), skipping auto-commit"
        return 0
    fi
    
    # Check if there are changes to commit
    if ! has_changes; then
        log "No changes detected, skipping commit"
        return 0
    fi
    
    # Stage all changes
    git add -A
    
    # Get changes summary
    local changes_summary=$(get_changes_summary)
    
    # Generate commit message
    local commit_msg=$(generate_commit_message "$task_name" "$changes_summary")
    
    # Check for dry run
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log "DRY RUN: Would commit with message: $commit_msg"
        log "Staged files:"
        git diff --cached --name-only | while read -r file; do
            log "  $file"
        done
        return 0
    fi
    
    # Create commit
    if git commit -m "$commit_msg"; then
        log_success "Committed changes: $commit_msg"
        
        # Show commit details
        local commit_hash=$(git rev-parse HEAD)
        log "Commit hash: ${commit_hash:0:7}"
        
        # Optional: show diff stats
        if git diff --stat HEAD~1 HEAD >/dev/null 2>&1; then
            log "Changes summary:"
            git diff --stat HEAD~1 HEAD | head -n -1 | while read -r line; do
                log "  $line"
            done
        fi
    else
        log_error "Failed to create commit"
        return 1
    fi
}

# Backup current branch state before making changes
backup_branch_state() {
    local branch_name="$1"
    local backup_branch="backup-${branch_name}-$(date +%Y%m%d-%H%M%S)"
    
    git branch "$backup_branch" "$branch_name" 2>/dev/null || true
    log "Created backup branch: $backup_branch"
}

# Interactive mode for manual override
interactive_mode() {
    log "Interactive mode - confirm commit details:"
    read -p "Commit message: " -i "$(generate_commit_message "$(get_claude_task_name)" "$(get_changes_summary)")" commit_msg
    read -p "Proceed with commit? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        git commit -m "$commit_msg"
    else
        log "Commit cancelled by user"
    fi
}

# Emergency stop check
check_emergency_stop() {
    if [[ "${CLAUDE_NO_AUTO_COMMIT:-false}" == "true" ]]; then
        log "Auto-commit disabled by environment variable"
        return 1
    fi
    
    if [[ -f ".claude/no-auto-commit" ]]; then
        log "Auto-commit disabled by .claude/no-auto-commit file"
        return 1
    fi
    
    return 0
}

# Cleanup function
cleanup() {
    log "Auto-commit process completed"
}

# Handle script termination
trap cleanup EXIT

# Check emergency stop before proceeding
check_emergency_stop || exit 0

# Run main function
main "$@"