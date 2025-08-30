# Gmail-Based User Management System

## Overview
The Grocery POS system implements a comprehensive Gmail-based authentication and user management system that allows owners to manage multiple users with different access levels.

## System Architecture

### Authentication Flow
1. **Gmail Login**: Users authenticate using their Gmail credentials
2. **Role Verification**: System validates user role based on registered Gmail accounts
3. **Access Control**: Appropriate interface loads based on user permissions
4. **Session Management**: Secure session handling with logout functionality

### User Management Features

#### Owner Capabilities
- **Add Users**: Register unlimited Gmail accounts to the system
- **Role Assignment**: Assign Owner or Sales Person roles to users
- **Role Modification**: Change user roles dynamically
- **User Removal**: Remove users (except initial owner account)
- **User Overview**: View all registered users and their roles

#### Initial Setup
- **Default Owner**: First Gmail account (`owner@grocery.com`) automatically becomes Owner
- **Protected Account**: Initial owner account cannot be removed or have role changed
- **System Initialization**: Automatic setup on first access

## User Roles

### 👑 Owner Role
**Permissions:**
- Full access to sales dashboard and analytics
- Complete user management capabilities
- System configuration and settings
- Business intelligence and reporting
- Administrative control over all features

**Interface Features:**
- Sales dashboard access
- User management panel
- Administrative controls
- Full system navigation

### 🛍️ Sales Person Role
**Permissions:**
- Transaction processing and cart management
- Customer service operations
- Receipt generation and printing
- Item catalog access
- Operational sales functions only

**Interface Features:**
- Sales transaction interface
- Cart management tools
- Payment processing
- Restricted navigation (no dashboard/management)

## Technical Implementation

### Data Structure
```javascript
users = [
  {
    email: "user@gmail.com",
    role: "owner" | "sales",
    isInitial: true | false
  }
]
```

### Security Features
- **Email Validation**: Strict Gmail format validation
- **Duplicate Prevention**: No duplicate Gmail registrations
- **Role Protection**: Initial owner account protection
- **Session Security**: Secure logout and session management

### User Interface Components

#### Login Screen
- Gmail input field with validation
- Google-style authentication button
- Demo account information
- Error handling for unregistered accounts

#### User Management Panel (Owner Only)
- **Add User Form**: Email input and role selection
- **User List**: Display all registered users
- **Role Management**: Inline role change capability
- **User Removal**: Delete users with confirmation
- **Status Indicators**: Visual role and protection indicators

## Usage Scenarios

### Adding a New Sales Person
1. Owner logs in with Gmail
2. Clicks "Manage Users" button
3. Enters new user's Gmail address
4. Selects "Sales Person" role
5. Clicks "Add User"
6. New user can now login with their Gmail

### Changing User Roles
1. Owner accesses user management
2. Finds user in the list
3. Uses dropdown to change role
4. System updates immediately
5. User sees new permissions on next login

### Removing Users
1. Owner selects user to remove
2. Confirms deletion (except initial owner)
3. User account is permanently removed
4. Removed user cannot login anymore

## Demo Accounts
- **Owner**: `owner@grocery.com` (pre-configured)
- **Sales**: `sales@grocery.com` (can be added by owner)

## Benefits
- **Scalability**: Support unlimited users
- **Security**: Gmail-based authentication
- **Flexibility**: Dynamic role management
- **User Experience**: Intuitive management interface
- **Business Control**: Owner maintains full administrative control

## Future Enhancements
- Email verification for new users
- Bulk user import/export
- User activity logging
- Advanced permission levels
- Integration with Google Workspace
