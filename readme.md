# About

This is a private browser extension used by some employees of Able Canyon.
The extension adds functionality to Active Collab.
Active Collab is a 3rd party project management system.

## Basic Usage

In Active Collab, Able Canyon always creates 2 projects per client. 
1. The first project is client facing.  For example, it may be named "Example Project"  
2. The second project is internal.  It may be named "Example Project (Internal)"

This extension helps keep certain task attributes in sync between the projects.

## Supported Browsers

This task should work in the latest version of:

- Firefox on Mac

## Installation

These steps assume you have the repository checked out in a local directory.

In Firefox, do the following:

- In a new tab, paste "about:debugging#/runtime/this-firefox" into the url bar.
- Click the "Load Temporary Add-On..." button.
- In the dialog box that appears, navigate to the "manifest.json" file in the local repository directory.

## What's Kept in Sync When 2 Tasks are Linked

When 2 tasks are linked, we keep the following attributes in sync:

- Title
- Description
- Attachments
- Task List
- Due  (When a single due date is used)
- Start Date and End Date (When a date range is used)
- Hidden from clients
- High Priority

No other attributes are kept in sync.  Do NOT attempt to sync:

- Comments
- Assignee
- Etc.

## How are Tasks Linked

When editing a task, there's a button with an ellipsis in it.
Clicking this button opens a menu. 
At the bottom of the menu, the extension inserts a drop-down allowing a user to select the project to create the linked task in.

When 2 tasks are linked, each task has a label that starts with "sync-" which stores information about the linked tasks project id and task id.

## When are Tasks Synced

A linked task is updated when any of the above attributes are changed.

## Navigating Between Tasks

When a task is linked to another task, the extension inserts text above the task title.
The text reads "Able Canyon Internal Reference: {{Link to Task}}".
This allows the user to quickly navigate between the linked tasks.  