# Business Requirements: Grocery Shop Chain Sales Tracking

- Grocery shop chain owner wants to track sales from multiple sale terminals located in different shops.
- Each terminal runs on an Android device and acts as a simple point-of-sale (POS) terminal.
- POS terminal functions:
  - Takes customer orders.
  - Accepts cash payments.
  - Generates bills using a portable Bluetooth printer.
- Each sale transaction is recorded in a file on the terminal.
- At regular intervals, the terminal automatically emails the sales data file to the owner's email account.
- Each terminal uses a unique Gmail ID configured on its device.
- Devices have mobile internet or WiFi connectivity.
- Owner's mobile app parses the sales data from received emails and prepares a report for the owner's dashboard.
- The mobile app should be a lightweight client that is accessible from a browser and can also be installed on devices.
- The app should work seamlessly both online (with internet) and offline (without internet).
- The app should have a "Force Sync" button to manually trigger data synchronization.
- The app should display an indicator showing if there is any data pending for syncing.
- POS client maintains an item list with prices and category list, which are controlled by the owner.
- Items can be grouped based on category.
- There should be a default "Favorite" category where the most frequently used items are automatically added. Items will never be removed from their originally assigned category.
- Categories should have expand/collapse (arrow tip) buttons for user interaction.
- Categories are displayed in order: "Favorite" at the top, followed by all remaining categories in alphabetical order.
- Items within each category are sorted alphabetically by default.
- Items added to the cart can be added or removed at any stage before final payment.
- After payment and bill printing, the cart should reset to empty and be ready for the next order.
- Owner-side app will show a consolidated sales report in the dashboard.
- Owner app should be able to detect and handle duplicate sales data received via email.
- The app should use a configured Google Drive for persistence of report data in Google Sheets.
- The system should only use free Google services (such as Gmail and Google Drive) and should not require any payment to Google.
- Each device and terminal will use its own configured Google account to facilitate seamless operation of the system.

## User Roles and Access Control

### Gmail-Based Authentication System
- **Primary Authentication**: System uses Gmail accounts for user authentication
- **Role Assignment**: Each Gmail account is assigned either Owner or Sales Person role
- **Automatic Role Detection**: Users are automatically granted appropriate permissions based on their Gmail account
- **Centralized Management**: Owner manages all user roles and Gmail associations

### Owner Role Configuration
- **Initial Setup**: First Gmail account configured automatically becomes Owner
- **Administrative Access**: Owner can manage all user accounts and roles
- **User Management**: Owner can add, remove, and modify user roles
- **System Configuration**: Owner controls all system settings and configurations

### User Management Features
- **Add Users**: Owner can add unlimited Gmail accounts to the system
- **Role Assignment**: Owner assigns Owner or Sales Person role to each Gmail account
- **Role Modification**: Owner can change user roles at any time
- **User Removal**: Owner can remove users from the system
- **User List**: Owner can view all registered users and their roles

### Authentication Flow
- **Gmail Login**: Users authenticate using their Gmail credentials
- **Role Verification**: System verifies user role based on Gmail account
- **Automatic Access**: Appropriate interface loads based on user role
- **Session Management**: User sessions tied to Gmail authentication

### Owner Role Permissions
- Can access and view the sales dashboard
- Can view all sales reports and analytics
- Can manage item catalog and pricing
- Can manage user accounts and roles
- Can configure system settings
- Full administrative access to all features

### Sales Person Role Permissions
- Can perform sales transactions (add items, process payments)
- Can view item catalog for sales
- Can generate receipts
- **Cannot access sales dashboard or reporting features**
- **Cannot manage users or system settings**
- Limited to operational sales functions only

### Role-Based UI Requirements
- POS interface must adapt based on authenticated user role
- Sales dashboard and user management features hidden for sales person role
- Gmail-based login implemented at application startup
- Clear visual distinction between role capabilities
- Role-based navigation and feature availability
- User management interface available only to Owner role
