import { DocumentCategory, FAQCategory, Tutorial } from '@/types/documentation-types';

// Documentation data
export const documentationData: DocumentCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    documents: [
      {
        id: 'introduction',
        title: 'Introduction to STEPS',
        description: 'Learn about the STEPS Financial Workflow Management Application',
        lastUpdated: '2023-05-10',
        content: `
          <h2>Welcome to STEPS</h2>
          <p>STEPS is a comprehensive Financial Workflow Management Application designed to streamline and automate financial processes within your organization.</p>
          
          <h3>Key Features</h3>
          <ul>
            <li><strong>Workflow Management:</strong> Create, monitor, and manage complex financial workflows</li>
            <li><strong>Admin Interface:</strong> Configure and customize the system to your organization's needs</li>
            <li><strong>Operations Center:</strong> Monitor and manage day-to-day operations</li>
            <li><strong>Dashboards:</strong> Get real-time insights into your financial processes</li>
            <li><strong>Support System:</strong> Track and resolve issues efficiently</li>
          </ul>
          
          <h3>System Requirements</h3>
          <p>STEPS is a web-based application that works on all modern browsers:</p>
          <ul>
            <li>Google Chrome (recommended)</li>
            <li>Mozilla Firefox</li>
            <li>Microsoft Edge</li>
            <li>Safari</li>
          </ul>
          
          <p>For the best experience, we recommend using a desktop or laptop computer with a minimum screen resolution of 1366x768.</p>
        `
      },
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        description: 'Get up and running with STEPS in minutes',
        lastUpdated: '2023-05-15',
        content: `
          <h2>Quick Start Guide</h2>
          
          <h3>1. Logging In</h3>
          <p>Access the STEPS application using the URL provided by your administrator. Use your corporate credentials to log in.</p>
          
          <h3>2. Navigating the Interface</h3>
          <p>The STEPS interface consists of several key areas:</p>
          <ul>
            <li><strong>Left Sidebar:</strong> Main navigation menu</li>
            <li><strong>Header:</strong> Quick access to notifications, user settings, and theme toggle</li>
            <li><strong>Main Content Area:</strong> Displays the selected page content</li>
          </ul>
          
          <h3>3. Accessing Your Workflows</h3>
          <p>From the dashboard, you can:</p>
          <ul>
            <li>View all workflows assigned to you</li>
            <li>Check the status of each workflow</li>
            <li>Access workflow details by clicking on a workflow card</li>
          </ul>
          
          <h3>4. Working with Tasks</h3>
          <p>Within each workflow:</p>
          <ul>
            <li>View tasks assigned to you</li>
            <li>Complete tasks by updating their status</li>
            <li>Add comments or attachments as needed</li>
            <li>Escalate issues when necessary</li>
          </ul>
          
          <h3>5. Using Dashboards</h3>
          <p>Access dashboards from the left sidebar to view:</p>
          <ul>
            <li>Financial data visualizations</li>
            <li>Process performance metrics</li>
            <li>SLA compliance information</li>
          </ul>
        `
      },
      {
        id: 'user-roles',
        title: 'User Roles and Permissions',
        description: 'Understanding different user roles in STEPS',
        lastUpdated: '2023-06-01',
        content: `
          <h2>User Roles and Permissions</h2>
          
          <p>STEPS uses a role-based access control system to ensure users have appropriate access to features and data.</p>
          
          <h3>Standard Roles</h3>
          
          <h4>Basic User</h4>
          <ul>
            <li>View and work on assigned workflows and tasks</li>
            <li>View basic dashboards</li>
            <li>Submit support requests</li>
          </ul>
          
          <h4>Team Lead</h4>
          <ul>
            <li>All Basic User permissions</li>
            <li>Assign tasks to team members</li>
            <li>View team performance metrics</li>
            <li>Approve certain workflow stages</li>
          </ul>
          
          <h4>Manager</h4>
          <ul>
            <li>All Team Lead permissions</li>
            <li>Access to advanced dashboards</li>
            <li>Generate reports</li>
            <li>Configure workflow parameters</li>
          </ul>
          
          <h4>Administrator</h4>
          <ul>
            <li>Full system access</li>
            <li>User management</li>
            <li>Workflow configuration</li>
            <li>System settings</li>
            <li>Metadata management</li>
          </ul>
          
          <h3>Specialized Roles</h3>
          
          <h4>Support Specialist</h4>
          <ul>
            <li>Access to support dashboard</li>
            <li>Manage support tickets</li>
            <li>View system logs</li>
          </ul>
          
          <h4>Operations Specialist</h4>
          <ul>
            <li>Access to operations center</li>
            <li>Monitor system performance</li>
            <li>Manage operational issues</li>
          </ul>
          
          <h4>Auditor</h4>
          <ul>
            <li>Read-only access to all workflows</li>
            <li>Access to audit logs</li>
            <li>Generate compliance reports</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'workflows',
    name: 'Workflows',
    documents: [
      {
        id: 'workflow-basics',
        title: 'Workflow Basics',
        description: 'Understanding the core concepts of workflows in STEPS',
        lastUpdated: '2023-05-20',
        content: `
          <h2>Workflow Basics</h2>
          
          <p>Workflows in STEPS represent financial processes that follow a predefined sequence of stages and tasks.</p>
          
          <h3>Workflow Structure</h3>
          
          <h4>Hierarchy Levels</h4>
          <p>STEPS organizes workflows in a hierarchical structure:</p>
          <ul>
            <li><strong>Application:</strong> The top-level category (e.g., Financial Reporting)</li>
            <li><strong>Workflow:</strong> A specific process within an application (e.g., Monthly Close)</li>
            <li><strong>Stage:</strong> Major phases within a workflow (e.g., Data Collection)</li>
            <li><strong>Sub-stage:</strong> Smaller components of a stage (e.g., Regional Data Collection)</li>
            <li><strong>Task:</strong> Individual actions to be completed (e.g., Upload EMEA Data)</li>
          </ul>
          
          <h3>Workflow States</h3>
          <p>Each workflow can be in one of the following states:</p>
          <ul>
            <li><strong>Not Started:</strong> Workflow is created but not yet active</li>
            <li><strong>In Progress:</strong> Workflow is currently being executed</li>
            <li><strong>On Hold:</strong> Workflow is temporarily paused</li>
            <li><strong>Completed:</strong> All stages and tasks are finished</li>
            <li><strong>Failed:</strong> Workflow encountered a critical error</li>
          </ul>
          
          <h3>Working with Workflows</h3>
          
          <h4>Viewing Workflows</h4>
          <p>You can view workflows in several ways:</p>
          <ul>
            <li>Dashboard view: Shows all workflows you have access to</li>
            <li>List view: Detailed list with filtering options</li>
            <li>Detail view: Complete information about a specific workflow</li>
          </ul>
          
          <h4>Interacting with Workflows</h4>
          <p>Depending on your role, you can:</p>
          <ul>
            <li>Start or pause workflows</li>
            <li>Complete tasks within workflows</li>
            <li>Add comments or attachments</li>
            <li>Escalate issues</li>
            <li>View workflow history</li>
          </ul>
        `
      },
      {
        id: 'creating-workflows',
        title: 'Creating and Configuring Workflows',
        description: 'Learn how to create and configure workflows in STEPS',
        lastUpdated: '2023-06-05',
        content: `
          <h2>Creating and Configuring Workflows</h2>
          
          <p>This guide explains how to create and configure workflows in STEPS. Note that workflow creation typically requires administrator privileges.</p>
          
          <h3>Creating a New Workflow</h3>
          
          <h4>Step 1: Access Workflow Configuration</h4>
          <p>Navigate to Admin Dashboard > Workflow Configuration to access the workflow creation tools.</p>
          
          <h4>Step 2: Define Basic Information</h4>
          <p>Provide the following information:</p>
          <ul>
            <li>Workflow Name: A descriptive name for the workflow</li>
            <li>Application: The parent application for this workflow</li>
            <li>Description: A detailed description of the workflow's purpose</li>
            <li>Owner: The user or team responsible for the workflow</li>
            <li>Schedule: How often the workflow should run (daily, weekly, monthly, etc.)</li>
          </ul>
          
          <h4>Step 3: Design Workflow Structure</h4>
          <p>Create the stages and sub-stages for your workflow:</p>
          <ul>
            <li>Add stages by clicking "Add Stage"</li>
            <li>For each stage, define a name, description, and estimated duration</li>
            <li>Add sub-stages to each stage as needed</li>
            <li>Define dependencies between stages (which stages must complete before others can start)</li>
          </ul>
          
          <h4>Step 4: Configure Tasks</h4>
          <p>For each sub-stage, define the tasks that need to be completed:</p>
          <ul>
            <li>Task name and description</li>
            <li>Assignee (user, role, or team)</li>
            <li>Estimated duration</li>
            <li>Required inputs and outputs</li>
            <li>Approval requirements</li>
          </ul>
          
          <h4>Step 5: Set Up Notifications</h4>
          <p>Configure notifications for the workflow:</p>
          <ul>
            <li>Task assignments</li>
            <li>Due date reminders</li>
            <li>Stage completions</li>
            <li>Workflow status changes</li>
            <li>SLA breaches</li>
          </ul>
          
          <h4>Step 6: Activate the Workflow</h4>
          <p>Once configuration is complete, activate the workflow to make it available for use.</p>
          
          <h3>Modifying Existing Workflows</h3>
          <p>To modify an existing workflow:</p>
          <ol>
            <li>Navigate to Admin Dashboard > Workflow Configuration</li>
            <li>Select the workflow you want to modify</li>
            <li>Make the necessary changes</li>
            <li>Save your changes</li>
            <li>If the workflow is already in use, you may need to version it to avoid disrupting active instances</li>
          </ol>
        `
      }
    ]
  },
  {
    id: 'dashboards',
    name: 'Dashboards',
    documents: [
      {
        id: 'finance-dashboard',
        title: 'Finance Dashboard Guide',
        description: 'How to use the Finance Dashboard effectively',
        lastUpdated: '2023-06-10',
        content: `
          <h2>Finance Dashboard Guide</h2>
          
          <p>The Finance Dashboard provides real-time visualizations and insights into your financial data and processes.</p>
          
          <h3>Accessing the Dashboard</h3>
          <p>You can access the Finance Dashboard in two ways:</p>
          <ul>
            <li>From the left sidebar menu under "Main" > "Finance Dashboard"</li>
            <li>From a workflow detail page by clicking the "Finance Dashboard" button</li>
          </ul>
          
          <h3>Dashboard Views</h3>
          <p>The Finance Dashboard offers three main views:</p>
          
          <h4>Tile View</h4>
          <p>Displays all financial tiles in a responsive grid layout. This view is ideal for getting a comprehensive overview of all financial metrics.</p>
          
          <h4>Split View</h4>
          <p>Shows a main visualization on the left and smaller tiles on the right. Below the main content, you'll find a data grid or pivot grid for detailed analysis. This view is perfect for focusing on one key metric while keeping an eye on related indicators.</p>
          
          <h4>Full View</h4>
          <p>Dedicates the entire screen to a single visualization with the ability to switch between tiles. A data grid or pivot grid appears below the visualization. Use this view when you need to analyze a specific metric in depth.</p>
          
          <h3>Working with Tiles</h3>
          
          <h4>Tile Types</h4>
          <p>The dashboard includes various tile types:</p>
          <ul>
            <li><strong>Bar Charts:</strong> For comparing values across categories</li>
            <li><strong>Line Charts:</strong> For showing trends over time</li>
            <li><strong>Pie Charts:</strong> For displaying proportions of a whole</li>
            <li><strong>Progress Indicators:</strong> For showing completion or target achievement</li>
            <li><strong>KPI Cards:</strong> For highlighting key performance indicators</li>
            <li><strong>Data Tables:</strong> For presenting detailed numerical data</li>
          </ul>
          
          <h4>Tile Interactions</h4>
          <p>Each tile offers several interactive features:</p>
          <ul>
            <li><strong>Expand:</strong> Click the expand icon to view the tile in full-screen mode</li>
            <li><strong>Pin:</strong> Pin important tiles to keep them visible in all views</li>
            <li><strong>Refresh:</strong> Manually refresh the data in a specific tile</li>
            <li><strong>Download:</strong> Export the tile data as CSV or the visualization as an image</li>
            <li><strong>Configure:</strong> (Admin only) Modify the tile's settings and data source</li>
          </ul>
          
          <h3>Data Analysis Features</h3>
          
          <h4>Filtering</h4>
          <p>Apply filters to focus on specific data segments:</p>
          <ul>
            <li>Date range filters</li>
            <li>Category filters</li>
            <li>Value range filters</li>
          </ul>
          
          <h4>Sorting and Grouping</h4>
          <p>In data grid views, you can:</p>
          <ul>
            <li>Sort columns in ascending or descending order</li>
            <li>Group data by one or more columns</li>
            <li>Aggregate values using sum, average, count, etc.</li>
          </ul>
          
          <h4>Exporting Data</h4>
          <p>Export dashboard data in various formats:</p>
          <ul>
            <li>CSV for spreadsheet analysis</li>
            <li>PDF for reporting</li>
            <li>PNG/JPG for presentations</li>
          </ul>
        `
      },
      {
        id: 'operations-dashboard',
        title: 'Operations Dashboard Guide',
        description: 'Understanding and using the Operations Dashboard',
        lastUpdated: '2023-06-15',
        content: `
          <h2>Operations Dashboard Guide</h2>
          
          <p>The Operations Dashboard provides a comprehensive view of your operational processes, system health, and performance metrics.</p>
          
          <h3>Dashboard Overview</h3>
          
          <p>The Operations Dashboard is designed for operations teams to monitor and manage the day-to-day running of financial processes. It provides real-time visibility into:</p>
          
          <ul>
            <li>Process execution status</li>
            <li>System performance</li>
            <li>Resource utilization</li>
            <li>Error rates and issues</li>
            <li>SLA compliance</li>
          </ul>
          
          <h3>Key Components</h3>
          
          <h4>Process Monitoring</h4>
          <p>The Process Monitoring section shows:</p>
          <ul>
            <li>Active processes and their current status</li>
            <li>Process execution times</li>
            <li>Success and failure rates</li>
            <li>Bottlenecks and delays</li>
          </ul>
          
          <h4>System Health</h4>
          <p>The System Health section displays:</p>
          <ul>
            <li>Server status and performance</li>
            <li>Database performance</li>
            <li>API response times</li>
            <li>Error rates and types</li>
          </ul>
          
          <h4>Resource Utilization</h4>
          <p>This section shows:</p>
          <ul>
            <li>CPU and memory usage</li>
            <li>Storage utilization</li>
            <li>Network bandwidth</li>
            <li>User concurrency</li>
          </ul>
          
          <h4>Alerts and Notifications</h4>
          <p>The dashboard highlights:</p>
          <ul>
            <li>Critical alerts requiring immediate attention</li>
            <li>Warning alerts indicating potential issues</li>
            <li>Informational notifications</li>
            <li>Recent alert history</li>
          </ul>
          
          <h3>Using the Dashboard</h3>
          
          <h4>Monitoring Processes</h4>
          <p>To monitor specific processes:</p>
          <ol>
            <li>Use the process filter to select the processes you want to monitor</li>
            <li>View real-time status and performance metrics</li>
            <li>Drill down into specific processes for detailed information</li>
            <li>Set up custom alerts for critical processes</li>
          </ol>
          
          <h4>Responding to Alerts</h4>
          <p>When an alert appears:</p>
          <ol>
            <li>Click on the alert to view details</li>
            <li>Assess the severity and impact</li>
            <li>Take appropriate action based on the alert type</li>
            <li>Mark the alert as acknowledged or resolved</li>
            <li>Document any actions taken</li>
          </ol>
          
          <h4>Performance Analysis</h4>
          <p>To analyze system performance:</p>
          <ol>
            <li>Select the time period for analysis</li>
            <li>Compare current performance with historical benchmarks</li>
            <li>Identify trends and patterns</li>
            <li>Generate performance reports</li>
          </ol>
        `
      },
      {
        id: 'support-dashboard',
        title: 'Support Dashboard Guide',
        description: 'How to use the Support Dashboard to manage issues',
        lastUpdated: '2023-06-20',
        content: `
          <h2>Support Dashboard Guide</h2>
          
          <p>The Support Dashboard is designed to help support teams track and resolve issues efficiently.</p>
          
          <h3>Dashboard Overview</h3>
          
          <p>The Support Dashboard focuses on process-level issues and provides tools for:</p>
          <ul>
            <li>Issue tracking and management</li>
            <li>SLA monitoring</li>
            <li>Team performance analysis</li>
            <li>Issue reporting and resolution</li>
          </ul>
          
          <h3>Issue Management</h3>
          
          <h4>Viewing Issues</h4>
          <p>The main issue list displays:</p>
          <ul>
            <li>Process ID: The affected process</li>
            <li>Issue team: The team responsible for the issue</li>
            <li>Reported by: Who reported the issue</li>
            <li>Working on by: Who is currently addressing the issue</li>
            <li>Fix time: Estimated or actual resolution time</li>
            <li>Business date: The business date associated with the issue</li>
            <li>Created/Updated: When the issue was created and last updated</li>
          </ul>
          
          <h4>Creating Issues</h4>
          <p>To create a new support issue:</p>
          <ol>
            <li>Click the "Create Issue" button</li>
            <li>Select the affected application and process</li>
            <li>Provide a clear description of the issue</li>
            <li>Set the priority level</li>
            <li>Assign to a team or individual (if known)</li>
            <li>Add any relevant attachments or screenshots</li>
            <li>Submit the issue</li>
          </ol>
          
          <h4>Updating Issues</h4>
          <p>To update an existing issue:</p>
          <ol>
            <li>Select the issue from the list</li>
            <li>Click "Update Issue"</li>
            <li>Update the status, assignee, or other details</li>
            <li>Add comments to document progress</li>
            <li>Attach any new relevant files</li>
            <li>Save the changes</li>
          </ol>
          
          <h4>Closing Issues</h4>
          <p>To close a resolved issue:</p>
          <ol>
            <li>Select the issue</li>
            <li>Click "Close Issue"</li>
            <li>Provide resolution details</li>
            <li>Select a resolution category</li>
            <li>Document any follow-up actions</li>
            <li>Confirm closure</li>
          </ol>
          
          <h3>SLA Dashboard</h3>
          
          <p>The SLA Dashboard shows:</p>
          <ul>
            <li>Current SLA compliance rates</li>
            <li>Issues approaching SLA breach</li>
            <li>Issues that have breached SLA</li>
            <li>Average resolution times by issue type and priority</li>
          </ul>
          
          <h3>Filtering and Reporting</h3>
          
          <h4>Filtering Issues</h4>
          <p>Filter the issue list by:</p>
          <ul>
            <li>Application</li>
            <li>Business date</li>
            <li>Status</li>
            <li>Priority</li>
            <li>Assignee</li>
            <li>Date range</li>
          </ul>
          
          <h4>Generating Reports</h4>
          <p>Create reports on:</p>
          <ul>
            <li>Issue volume and trends</li>
            <li>Resolution times</li>
            <li>SLA compliance</li>
            <li>Team performance</li>
            <li>Common issue types</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'admin',
    name: 'Administration',
    documents: [
      {
        id: 'metadata-management',
        title: 'Metadata Management Guide',
        description: 'How to configure system metadata',
        lastUpdated: '2023-07-01',
        content: `
          <h2>Metadata Management Guide</h2>
          
          <p>Metadata Management allows administrators to configure the core data structures that define how STEPS operates.</p>
          
          <h3>Accessing Metadata Management</h3>
          
          <p>To access the Metadata Management interface:</p>
          <ol>
            <li>Navigate to the Admin Dashboard</li>
            <li>Select "Metadata Management" from the admin menu</li>
          </ol>
          
          <h3>Metadata Components</h3>
          
          <h4>Stages & Sub-Stages</h4>
          <p>This tab allows you to define and manage workflow stages and sub-stages:</p>
          <ul>
            <li><strong>Creating Stages:</strong> Define new workflow stages with numeric IDs (starting from 1)</li>
            <li><strong>Creating Sub-Stages:</strong> Add sub-stages to parent stages with IDs that use the parent stage ID with a numeric suffix</li>
            <li><strong>Stage Properties:</strong> Configure name, description, default duration, and other properties</li>
            <li><strong>Stage Selection Filter:</strong> Use the filter to find specific stages quickly</li>
          </ul>
          
          <h4>Parameters</h4>
          <p>The Parameters tab allows you to define system-wide parameters:</p>
          <ul>
            <li><strong>Parameter Types:</strong> String, Number, Boolean, Date, JSON</li>
            <li><strong>Scope:</strong> Global, Application, Workflow, Stage</li>
            <li><strong>Default Values:</strong> Set default values for parameters</li>
            <li><strong>Validation Rules:</strong> Define rules to validate parameter values</li>
          </ul>
          
          <h4>Attestations</h4>
          <p>Configure attestation requirements for workflows:</p>
          <ul>
            <li><strong>Attestation Types:</strong> Define different types of attestations</li>
            <li><strong>Required Signatories:</strong> Specify roles required for sign-off</li>
            <li><strong>Attestation Forms:</strong> Design attestation forms and questionnaires</li>
            <li><strong>Audit Trail:</strong> Configure how attestations are tracked for audit purposes</li>
          </ul>
          
          <h4>Email Templates</h4>
          <p>Manage email notification templates:</p>
          <ul>
            <li><strong>Template Editor:</strong> Create and edit HTML email templates with a rich text editor</li>
            <li><strong>Variables:</strong> Insert dynamic variables that will be populated at runtime</li>
            <li><strong>Preview:</strong> Preview how emails will appear to recipients</li>
            <li><strong>Character Limit:</strong> Templates are subject to a character limit to ensure deliverability</li>
          </ul>
          
          <h3>Best Practices</h3>
          
          <h4>Naming Conventions</h4>
          <p>Follow these naming conventions for consistency:</p>
          <ul>
            <li>Use clear, descriptive names for all metadata elements</li>
            <li>Prefix stage names with numbers to indicate sequence (e.g., "1. Data Collection")</li>
            <li>Use consistent terminology across related metadata elements</li>
          </ul>
          
          <h4>Documentation</h4>
          <p>Always provide thorough documentation:</p>
          <ul>
            <li>Include detailed descriptions for all metadata elements</li>
            <li>Document the purpose and usage of parameters</li>
            <li>Explain validation rules and their business justification</li>
          </ul>
          
          <h4>Testing Changes</h4>
          <p>Before implementing metadata changes in production:</p>
          <ul>
            <li>Test changes in a non-production environment</li>
            <li>Verify that existing workflows are not negatively impacted</li>
            <li>Conduct user acceptance testing for significant changes</li>
          </ul>
        `
      },
      {
        id: 'user-management',
        title: 'User and Role Management',
        description: 'Managing users, roles, and permissions',
        lastUpdated: '2023-07-05',
        content: `
          <h2>User and Role Management</h2>
          
          <p>This guide explains how to manage users, roles, and permissions in STEPS.</p>
          
          <h3>User Management</h3>
          
          <h4>Adding Users</h4>
          <p>To add a new user to the system:</p>
          <ol>
            <li>Navigate to Admin Dashboard > User Management</li>
            <li>Click "Add User"</li>
            <li>Enter the user's details:
              <ul>
                <li>Username (typically their email address)</li>
                <li>Full name</li>
                <li>Email address</li>
                <li>Department/Team</li>
                <li>Initial password (or select "Send setup email")</li>
              </ul>
            </li>
            <li>Assign roles to the user</li>
            <li>Set any user-specific permissions</li>
            <li>Click "Create User"</li>
          </ol>
          
          <h4>Editing Users</h4>
          <p>To modify an existing user:</p>
          <ol>
            <li>Navigate to Admin Dashboard > User Management</li>
            <li>Search for the user by name, email, or username</li>
            <li>Click on the user to view their details</li>
            <li>Make the necessary changes</li>
            <li>Click "Save Changes"</li>
          </ol>
          
          <h4>Deactivating Users</h4>
          <p>When a user no longer needs access:</p>
          <ol>
            <li>Navigate to Admin Dashboard > User Management</li>
            <li>Find the user and open their profile</li>
            <li>Click "Deactivate User"</li>
            <li>Confirm the deactivation</li>
            <li>Optionally, reassign their active tasks to another user</li>
          </ol>
          
          <h3>Role Management</h3>
          
          <h4>Standard Roles</h4>
          <p>STEPS comes with several predefined roles:</p>
          <ul>
            <li>Basic User</li>
            <li>Team Lead</li>
            <li>Manager</li>
            <li>Administrator</li>
            <li>Support Specialist</li>
            <li>Operations Specialist</li>
            <li>Auditor</li>
          </ul>
          
          <h4>Creating Custom Roles</h4>
          <p>To create a custom role:</p>
          <ol>
            <li>Navigate to Admin Dashboard > Role Management</li>
            <li>Click "Create Role"</li>
            <li>Provide a name and description for the role</li>
            <li>Define the permissions for the role</li>
            <li>Click "Save Role"</li>
          </ol>
          
          <h4>Modifying Roles</h4>
          <p>To modify an existing role:</p>
          <ol>
            <li>Navigate to Admin Dashboard > Role Management</li>
            <li>Select the role you want to modify</li>
            <li>Update the role's permissions</li>
            <li>Click "Save Changes"</li>
          </ol>
          
          <h3>Permission Management</h3>
          
          <h4>Permission Types</h4>
          <p>STEPS uses several types of permissions:</p>
          <ul>
            <li><strong>Feature Permissions:</strong> Access to specific features or pages</li>
            <li><strong>Data Permissions:</strong> Access to specific data or records</li>
            <li><strong>Action Permissions:</strong> Ability to perform specific actions</li>
            <li><strong>Administrative Permissions:</strong> System configuration capabilities</li>
          </ul>
          
          <h4>Setting Permissions</h4>
          <p>Permissions can be set at three levels:</p>
          <ul>
            <li><strong>Role Level:</strong> Permissions assigned to all users with a specific role</li>
            <li><strong>Group Level:</strong> Permissions assigned to all users in a specific group</li>
            <li><strong>User Level:</strong> Permissions assigned to specific individual users</li>
          </ul>
          
          <h4>Permission Inheritance</h4>
          <p>Permissions follow these inheritance rules:</p>
          <ul>
            <li>User-level permissions override group-level permissions</li>
            <li>Group-level permissions override role-level permissions</li>
            <li>When a user has multiple roles, they receive all permissions from all roles</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'user-guides',
    name: 'User Guides',
    documents: [
      {
        id: 'workflow-execution',
        title: 'Executing Workflows',
        description: 'Step-by-step guide to executing workflows',
        lastUpdated: '2023-07-10',
        content: `
          <h2>Executing Workflows</h2>
          
          <p>This guide walks you through the process of executing workflows in STEPS.</p>
          
          <h3>Starting a Workflow</h3>
          
          <h4>Manual Workflow Initiation</h4>
          <p>To manually start a workflow:</p>
          <ol>
            <li>Navigate to the Dashboard or Workflow List</li>
            <li>Click "Start New Workflow"</li>
            <li>Select the workflow template you want to use</li>
            <li>Fill in the required initial parameters:
              <ul>
                <li>Business date</li>
                <li>Region/entity</li>
                <li>Other workflow-specific parameters</li>
              </ul>
            </li>
            <li>Click "Start Workflow"</li>
          </ol>
          
          <h4>Scheduled Workflows</h4>
          <p>Scheduled workflows start automatically based on their configured schedule. You can view upcoming scheduled workflows in the Calendar view.</p>
          
          <h3>Working with Tasks</h3>
          
          <h4>Finding Your Tasks</h4>
          <p>To find tasks assigned to you:</p>
          <ol>
            <li>Go to the Dashboard to see your active tasks</li>
            <li>Alternatively, navigate to "My Tasks" in the sidebar</li>
            <li>Use filters to sort by due date, priority, or workflow</li>
          </ol>
          
          <h4>Completing Tasks</h4>
          <p>To complete a task:</p>
          <ol>
            <li>Select the task from your task list</li>
            <li>Review the task details and requirements</li>
            <li>Perform the required actions:
              <ul>
                <li>Upload required documents</li>
                <li>Enter required data</li>
                <li>Review and approve content</li>
                <li>Perform calculations or validations</li>
              </ul>
            </li>
            <li>Add any necessary comments</li>
            <li>Click "Complete Task"</li>
          </ol>
          
          <h4>Task Dependencies</h4>
          <p>Some tasks may be dependent on others:</p>
          <ul>
            <li>Dependent tasks cannot be started until their prerequisites are completed</li>
            <li>You can view task dependencies in the workflow diagram</li>
            <li>The system will notify you when dependent tasks become available</li>
          </ul>
          
          <h3>Monitoring Workflow Progress</h3>
          
          <h4>Workflow Detail View</h4>
          <p>To monitor a specific workflow:</p>
          <ol>
            <li>Navigate to the Workflow List</li>
            <li>Select the workflow you want to monitor</li>
            <li>The Workflow Detail View shows:
              <ul>
                <li>Current status and progress</li>
                <li>Completed and pending stages</li>
                <li>Active tasks and their assignees</li>
                <li>Timeline and SLA information</li>
                <li>Issues and blockers</li>
              </ul>
            </li>
          </ol>
          
          <h4>Progress Indicators</h4>
          <p>STEPS provides several progress indicators:</p>
          <ul>
            <li>Stage completion percentage</li>
            <li>Timeline view showing planned vs. actual progress</li>
            <li>SLA compliance indicators</li>
            <li>Critical path highlighting</li>
          </ul>
          
          <h3>Handling Exceptions</h3>
          
          <h4>Reporting Issues</h4>
          <p>If you encounter an issue during workflow execution:</p>
          <ol>
            <li>Click "Report Issue" on the workflow or task detail page</li>
            <li>Select the issue type and priority</li>
            <li>Provide a detailed description of the issue</li>
            <li>Attach any relevant screenshots or files</li>
            <li>Submit the issue</li>
          </ol>
          
          <h4>Workflow Interventions</h4>
          <p>Authorized users can perform interventions:</p>
          <ul>
            <li>Reassigning tasks</li>
            <li>Extending deadlines</li>
            <li>Bypassing steps (with appropriate approvals)</li>
            <li>Pausing and resuming workflows</li>
            <li>Rolling back to previous stages</li>
          </ul>
        `
      },
      {
        id: 'reporting-analytics',
        title: 'Reporting and Analytics',
        description: 'Using the reporting and analytics features',
        lastUpdated: '2023-07-15',
        content: `
          <h2>Reporting and Analytics</h2>
          
          <p>STEPS provides powerful reporting and analytics capabilities to help you gain insights into your financial processes.</p>
          
          <h3>Standard Reports</h3>
          
          <h4>Accessing Reports</h4>
          <p>To access standard reports:</p>
          <ol>
            <li>Navigate to the Reports section from the sidebar</li>
            <li>Browse the available report categories</li>
            <li>Select the report you want to view</li>
          </ol>
          
          <h4>Common Reports</h4>
          <p>STEPS includes several standard reports:</p>
          <ul>
            <li><strong>Workflow Performance:</strong> Execution times, SLA compliance, bottlenecks</li>
            <li><strong>User Activity:</strong> Task completion rates, response times, workload distribution</li>
            <li><strong>Process Compliance:</strong> Policy adherence, approval statistics, exception rates</li>
            <li><strong>Financial Metrics:</strong> Process-specific financial KPIs and trends</li>
          </ul>
          
          <h3>Custom Reports</h3>
          
          <h4>Report Builder</h4>
          <p>To create a custom report:</p>
          <ol>
            <li>Navigate to Reports > Custom Reports</li>
            <li>Click "Create New Report"</li>
            <li>Select the data sources you want to include</li>
            <li>Choose the fields to display</li>
            <li>Define any filters or parameters</li>
            <li>Set up grouping and sorting</li>
            <li>Add calculations or aggregations</li>
            <li>Preview and save your report</li>
          </ol>
          
          <h4>Scheduling Reports</h4>
          <p>To schedule automatic report generation:</p>
          <ol>
            <li>Open the report you want to schedule</li>
            <li>Click "Schedule"</li>
            <li>Set the frequency (daily, weekly, monthly)</li>
            <li>Specify the delivery method (email, system notification, file export)</li>
            <li>Add recipients if delivering via email</li>
            <li>Save the schedule</li>
          </ol>
          
          <h3>Analytics Dashboards</h3>
          
          <h4>Finance Dashboard</h4>
          <p>The Finance Dashboard provides:</p>
          <ul>
            <li>Real-time financial metrics</li>
            <li>Trend analysis</li>
            <li>Comparative visualizations</li>
            <li>Drill-down capabilities</li>
            <li>Customizable views (Tile, Split, Full)</li>
          </ul>
          
          <h4>Operations Dashboard</h4>
          <p>The Operations Dashboard shows:</p>
          <ul>
            <li>Process execution metrics</li>
            <li>System performance indicators</li>
            <li>Resource utilization</li>
            <li>Error rates and patterns</li>
            <li>SLA compliance statistics</li>
          </ul>
          
          <h4>Support Dashboard</h4>
          <p>The Support Dashboard displays:</p>
          <ul>
            <li>Open issues and their status</li>
            <li>Resolution times and trends</li>
            <li>SLA compliance for support activities</li>
            <li>Common issue categories</li>
            <li>Team performance metrics</li>
          </ul>
          
          <h3>Data Export</h3>
          
          <h4>Export Formats</h4>
          <p>Data can be exported in various formats:</p>
          <ul>
            <li>CSV for spreadsheet analysis</li>
            <li>Excel for formatted reports</li>
            <li>PDF for formal documentation</li>
            <li>JSON for system integration</li>
          </ul>
          
          <h4>Automated Exports</h4>
          <p>Set up automated data exports:</p>
          <ol>
            <li>Navigate to Reports > Data Exports</li>
            <li>Click "New Export Configuration"</li>
            <li>Select the data to export</li>
            <li>Choose the export format</li>
            <li>Set the export schedule</li>
            <li>Configure the destination (email, SFTP, network share)</li>
            <li>Save the configuration</li>
          </ol>
        `
      }
    ]
  }
];

// FAQ data
export const faqData: FAQCategory[] = [
  {
    id: 'general',
    name: 'General Questions',
    items: [
      {
        question: 'What is STEPS?',
        answer: 'STEPS is a comprehensive Financial Workflow Management Application designed to streamline and automate financial processes within your organization. It provides tools for workflow management, process monitoring, and financial analytics.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'To reset your password, click on the "Forgot Password" link on the login page. Enter your email address, and you will receive instructions to reset your password. Alternatively, you can contact your system administrator for assistance.'
      },
      {
        question: 'What browsers are supported?',
        answer: 'STEPS works best with modern browsers such as Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari. For the optimal experience, we recommend using the latest version of Google Chrome.'
      },
      {
        question: 'Is there a mobile app available?',
        answer: 'Currently, STEPS is optimized for desktop use. While the web interface is responsive and can be accessed on mobile devices, a dedicated mobile app is planned for future releases.'
      },
      {
        question: 'How do I report a bug or issue?',
        answer: 'You can report bugs or issues in several ways:<ul><li>Click the "Report Issue" button in the workflow detail view</li><li>Navigate to the Support Dashboard and click "Create Issue"</li><li>Contact your system administrator or support team directly</li></ul>'
      }
    ]
  },
  {
    id: 'workflows',
    name: 'Workflows & Tasks',
    items: [
      {
        question: 'How do I start a new workflow?',
        answer: 'To start a new workflow:<ol><li>Navigate to the Dashboard or Workflow List</li><li>Click "Start New Workflow"</li><li>Select the workflow template you want to use</li><li>Fill in the required initial parameters</li><li>Click "Start Workflow"</li></ol>'
      },
      {
        question: 'Can I modify a workflow after it has started?',
        answer: 'Once a workflow has started, certain modifications are possible depending on your role and permissions:<ul><li>Administrators can modify workflow parameters, deadlines, and assignees</li><li>Stage owners can adjust tasks within their stages</li><li>For significant structural changes, it may be necessary to create a new workflow instance</li></ul>'
      },
      {
        question: 'What happens if I miss a task deadline?',
        answer: 'When a task deadline is missed:<ul><li>The task is flagged as overdue</li><li>Notifications are sent to you and your supervisor</li><li>The task appears in the SLA breach report</li><li>Depending on configuration, the workflow may be escalated or paused</li></ul>'
      },
      {
        question: 'How do I reassign a task to someone else?',
        answer: 'To reassign a task:<ol><li>Open the task details</li><li>Click the "Reassign" button</li><li>Select the new assignee from the dropdown list</li><li>Optionally, add a comment explaining the reassignment</li><li>Click "Confirm Reassignment"</li></ol>Note that you need appropriate permissions to reassign tasks.'
      },
      {
        question: 'Can I work on multiple tasks simultaneously?',
        answer: 'Yes, you can work on multiple tasks simultaneously. Your task list shows all tasks assigned to you across different workflows. You can switch between tasks as needed and work on them in parallel.'
      }
    ]
  },
  {
    id: 'dashboards',
    name: 'Dashboards & Reporting',
    items: [
      {
        question: 'How do I customize the Finance Dashboard?',
        answer: 'To customize the Finance Dashboard:<ol><li>Navigate to Finance > Configure</li><li>Use the Tile Configurator to add, remove, or modify tiles</li><li>Drag and drop tiles to reorder them</li><li>Configure each tile\'s data source, chart type, and display options</li><li>Save your configuration</li></ol>'
      },
      {
        question: 'Can I export data from dashboards?',
        answer: 'Yes, you can export data from dashboards in several ways:<ul><li>Click the download icon on individual tiles to export that tile\'s data</li><li>Use the dashboard\'s "Export" button to export all dashboard data</li><li>Available formats include CSV, Excel, PDF, and image formats for visualizations</li></ul>'
      },
      {
        question: 'How often is dashboard data refreshed?',
        answer: 'Dashboard data refresh rates vary:<ul><li>By default, dashboards refresh automatically every 5 minutes</li><li>You can manually refresh a dashboard using the refresh button</li><li>Individual tiles can be configured with different refresh intervals</li><li>Real-time dashboards may update continuously for critical metrics</li></ul>'
      },
      {
        question: 'How do I create a custom report?',
        answer: 'To create a custom report:<ol><li>Navigate to Reports > Custom Reports</li><li>Click "Create New Report"</li><li>Select data sources and fields</li><li>Configure filters, grouping, and sorting</li><li>Add calculations or aggregations</li><li>Preview and save your report</li></ol>'
      },
      {
        question: 'Can I schedule reports to be sent automatically?',
        answer: 'Yes, you can schedule automatic report generation:<ol><li>Open the report you want to schedule</li><li>Click "Schedule"</li><li>Set the frequency (daily, weekly, monthly)</li><li>Specify the delivery method (email, notification, file export)</li><li>Add recipients if delivering via email</li><li>Save the schedule</li></ol>'
      }
    ]
  },
  {
    id: 'admin',
    name: 'Administration',
    items: [
      {
        question: 'How do I add a new user to the system?',
        answer: 'To add a new user:<ol><li>Navigate to Admin Dashboard > User Management</li><li>Click "Add User"</li>Enter the user\'s details (username, full name, email, department)</li><li>Assign roles to the user</li><li>Set any user-specific permissions</li><li>Click "Create User"</li></ol>'
      },
      {
        question: 'How do I create a new workflow template?',
        answer: 'To create a new workflow template:<ol><li>Navigate to Admin Dashboard > Workflow Configuration</li><li>Click "Create Workflow Template"</li><li>Define basic information (name, description, owner)</li><li>Design the workflow structure (stages and sub-stages)</li><li>Configure tasks for each sub-stage</li><li>Set up notifications</li><li>Activate the workflow template</li></ol>'
      },
      {
        question: 'What\'s the difference between roles and permissions?',
        answer: 'Roles and permissions differ in the following ways:<ul><li>Roles are predefined sets of permissions assigned to users</li><li>Permissions are specific access rights to features or data</li><li>A user can have multiple roles</li><li>Permissions can be assigned directly to users or inherited from roles</li><li>Roles simplify permission management by grouping common permissions</li></ul>'
      },
      {
        question: 'How do I configure system-wide settings?',
        answer: 'To configure system-wide settings:<ol><li>Navigate to Admin Dashboard > System Settings</li><li>Select the category of settings you want to modify</li><li>Adjust the settings as needed</li><li>Save your changes</li><li>Some settings may require a system restart to take effect</li></ol>'
      },
      {
        question: 'How do I view system logs?',
        answer: 'To view system logs:<ol><li>Navigate to Admin Dashboard > System Logs</li><li>Select the log type you want to view (application, audit, error)</li><li>Use filters to narrow down the log entries by date, severity, or source</li><li>Click on a log entry to view details</li><li>Use the export button to download logs for offline analysis</li></ol>'
      }
    ]
  },
  {
    id: 'support',
    name: 'Support & Troubleshooting',
    items: [
      {
        question: 'What should I do if a workflow is stuck?',
        answer: 'If a workflow appears to be stuck:<ol><li>Check the workflow details to identify the current stage and any pending tasks</li><li>Verify if there are any reported issues for the workflow</li><li>Contact the assignees of pending tasks to check for blockers</li><li>If necessary, use the "Report Issue" button to escalate to support</li><li>Administrators can use the workflow intervention tools to resolve the blockage</li></ol>'
      },
      {
        question: 'How do I troubleshoot login issues?',
        answer: 'If you\'re having trouble logging in:<ul><li>Verify that you\'re using the correct username and password</li><li>Check if Caps Lock is enabled</li><li>Clear your browser cache and cookies</li><li>Try using a different browser</li><li>If you\'ve forgotten your password, use the "Forgot Password" link</li><li>Contact your system administrator if the issue persists</li></ul>'
      },
      {
        question: 'What information should I include when reporting an issue?',
        answer: 'When reporting an issue, include the following information:<ul><li>A clear, concise description of the problem</li><li>Steps to reproduce the issue</li><li>The workflow ID or task ID if applicable</li><li>Screenshots or screen recordings if possible</li><li>Any error messages you received</li><li>The browser and device you\'re using</li><li>When the issue started occurring</li></ul>'
      },
      {
        question: 'How do I check the system status?',
        answer: 'To check the system status:<ol><li>Look at the status indicator in the footer of the application</li><li>Navigate to the Operations Dashboard for detailed system health information</li><li>Check the System Status page for any announced maintenance or known issues</li><li>Contact your system administrator for the most up-to-date information</li></ol>'
      },
      {
        question: 'Can I recover deleted data?',
        answer: 'Data recovery options depend on what was deleted:<ul><li>Recently deleted items may be available in the Recycle Bin (accessible to administrators)</li><li>Administrators can restore data from backups for more significant deletions</li><li>Some actions cannot be undone, particularly if they affect regulatory compliance</li><li>Contact your system administrator as soon as possible if you need to recover deleted data</li></ul>'
      }
    ]
  }
];

// Tutorial data
export const tutorialData: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with STEPS',
    description: 'Learn the basics of navigating and using the STEPS application',
    level: 'Beginner',
    duration: '15 minutes',
    thumbnailUrl: '/images/rect.png',
    categories: ['Basics', 'Navigation'],
    steps: [
      {
        title: 'Logging In',
        content: `
          <h3>Logging into STEPS</h3>
          <p>To begin using STEPS, you'll need to log in with your credentials.</p>
          
          <ol>
            <li>Open your web browser and navigate to the STEPS application URL</li>
            <li>Enter your username (typically your email address)</li>
            <li>Enter your password</li>
            <li>Click the "Log In" button</li>
          </ol>
          
          <p>If this is your first time logging in, you may be prompted to change your password and set up security questions.</p>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Tip:</p>
            <p>If you've forgotten your password, click the "Forgot Password" link on the login page to reset it.</p>
          </div>
        `,
        videoUrl: 'https://example.com/videos/login.mp4',
        resources: [
          {
            title: 'Password Policy Guide',
            description: 'Learn about password requirements and best practices',
            url: 'https://example.com/docs/password-policy.pdf'
          }
        ]
      },
      {
        title: 'Understanding the Interface',
        content: `
          <h3>The STEPS Interface</h3>
          <p>The STEPS interface is designed to be intuitive and efficient. Let's explore the main components:</p>
          
          <h4>Left Sidebar</h4>
          <p>The left sidebar contains the main navigation menu, organized into sections:</p>
          <ul>
            <li><strong>Main:</strong> Dashboard, Workflows, Finance Dashboard</li>
            <li><strong>Support Admin:</strong> Admin Dashboard, Operations Center, PnL Operations, Support Dashboard</li>
            <li><strong>Settings:</strong> User preferences and system settings</li>
          </ul>
          
          <h4>Header</h4>
          <p>The header at the top of the screen includes:</p>
          <ul>
            <li>Application logo</li>
            <li>Notifications bell</li>
            <li>Theme switcher (light/dark mode)</li>
            <li>User profile menu</li>
          </ul>
          
          <h4>Main Content Area</h4>
          <p>The main content area displays the selected page content, which changes based on your navigation.</p>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Tip:</p>
            <p>You can collapse the left sidebar by clicking the menu icon in the header to give more space to the main content area.</p>
          </div>
        `,
        videoUrl: 'https://example.com/videos/interface.mp4'
      },
      {
        title: 'Navigating the Dashboard',
        content: `
          <h3>The Main Dashboard</h3>
          <p>The dashboard is your starting point in STEPS, providing an overview of your workflows and tasks.</p>
          
          <h4>Dashboard Components</h4>
          <ul>
            <li><strong>Applications Grid:</strong> Shows the applications you have access to</li>
            <li><strong>Recent Activities:</strong> Displays recent actions and updates</li>
            <li><strong>Priority Approvals:</strong> Highlights items requiring your immediate attention</li>
            <li><strong>Workflow Stats:</strong> Provides metrics on workflow completion and status</li>
          </ul>
          
          <h4>Interacting with the Dashboard</h4>
          <p>From the dashboard, you can:</p>
          <ul>
            <li>Click on an application card to view its workflows</li>
            <li>Click on a workflow to view its details</li>
            <li>Check notifications for updates</li>
            <li>View and respond to priority items</li>
          </ul>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Tip:</p>
            <p>The dashboard automatically refreshes, but you can manually refresh it by clicking the refresh icon in the top-right corner of each section.</p>
          </div>
        `,
        resources: [
          {
            title: 'Dashboard Quick Reference',
            description: 'A printable guide to dashboard features',
            url: 'https://example.com/docs/dashboard-reference.pdf'
          }
        ]
      },
      {
        title: 'Accessing Help & Support',
        content: `
          <h3>Getting Help in STEPS</h3>
          <p>STEPS provides several ways to get help when you need it.</p>
          
          <h4>Help & Support Page</h4>
          <p>The Help & Support page offers comprehensive documentation and assistance:</p>
          <ul>
            <li><strong>Documentation:</strong> Detailed guides and reference materials</li>
            <li><strong>Tutorials:</strong> Step-by-step instructions for common tasks</li>
            <li><strong>FAQ:</strong> Answers to frequently asked questions</li>
            <li><strong>Contact Support:</strong> Options for reaching the support team</li>
          </ul>
          
          <h4>Contextual Help</h4>
          <p>Throughout the application, you'll find:</p>
          <ul>
            <li>Help icons (?) that provide information about specific features</li>
            <li>Tooltips that appear when you hover over elements</li>
            <li>"Learn More" links that take you to relevant documentation</li>
          </ul>
          
          <h4>Reporting Issues</h4>
          <p>If you encounter a problem:</p>
          <ul>
            <li>Use the "Report Issue" button in the workflow detail view</li>
            <li>Navigate to the Support Dashboard and click "Create Issue"</li>
            <li>Contact support directly through the Help & Support page</li>
          </ul>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Remember:</p>
            <p>When reporting issues, provide as much detail as possible to help the support team resolve your problem quickly.</p>
          </div>
        `,
        videoUrl: 'https://example.com/videos/getting-help.mp4'
      }
    ]
  },
  {
    id: 'workflow-basics',
    title: 'Working with Workflows',
    description: 'Learn how to navigate, execute, and monitor workflows',
    level: 'Beginner',
    duration: '25 minutes',
    thumbnailUrl: '/images/rect.png',
    categories: ['Workflows', 'Tasks'],
    steps: [
      {
        title: 'Understanding Workflow Structure',
        content: `
          <h3>Workflow Structure in STEPS</h3>
          <p>Before working with workflows, it's important to understand their structure.</p>
          
          <h4>Hierarchy Levels</h4>
          <p>STEPS organizes workflows in a hierarchical structure:</p>
          <ul>
            <li><strong>Application:</strong> The top-level category (e.g., Financial Reporting)</li>
            <li><strong>Workflow:</strong> A specific process within an application (e.g., Monthly Close)</li>
            <li><strong>Stage:</strong> Major phases within a workflow (e.g., Data Collection)</li>
            <li><strong>Sub-stage:</strong> Smaller components of a stage (e.g., Regional Data Collection)</li>
            <li><strong>Task:</strong> Individual actions to be completed (e.g., Upload EMEA Data)</li>
          </ul>
          
          <h4>Workflow States</h4>
          <p>Each workflow can be in one of the following states:</p>
          <ul>
            <li><strong>Not Started:</strong> Workflow is created but not yet active</li>
            <li><strong>In Progress:</strong> Workflow is currently being executed</li>
            <li><strong>On Hold:</strong> Workflow is temporarily paused</li>
            <li><strong>Completed:</strong> All stages and tasks are finished</li>
            <li><strong>Failed:</strong> Workflow encountered a critical error</li>
          </ul>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Key Concept:</p>
            <p>Understanding the workflow hierarchy helps you navigate the system and locate your tasks efficiently.</p>
          </div>
        `,
        resources: [
          {
            title: 'Workflow Hierarchy Diagram',
            description: 'Visual representation of workflow structure',
            url: 'https://example.com/docs/workflow-hierarchy.pdf'
          }
        ]
      },
      {
        title: 'Finding and Viewing Workflows',
        content: `
          <h3>Finding and Viewing Workflows</h3>
          <p>STEPS provides several ways to find and view workflows.</p>
          
          <h4>From the Dashboard</h4>
          <ol>
            <li>Navigate to the main dashboard</li>
            <li>Click on an application card to view its workflows</li>
            <li>Select a workflow from the list to view its details</li>
          </ol>
          
          <h4>Using the Workflow List</h4>
          <ol>
            <li>Click on "Workflows" in the left sidebar</li>
            <li>Use filters to narrow down the list:
              <ul>
                <li>Status (Not Started, In Progress, etc.)</li>
                <li>Date range</li>
                <li>Application</li>
                <li>Owner</li>
              </ul>
            </li>
            <li>Click on a workflow to view its details</li>
          </ol>
          
          <h4>Workflow Detail View</h4>
          <p>The Workflow Detail View shows:</p>
          <ul>
            <li>Workflow status and progress</li>
            <li>Stages and their completion status</li>
            <li>Tasks and their assignees</li>
            <li>Timeline and deadlines</li>
            <li>Related documents and comments</li>
          </ul>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Tip:</p>
            <p>Use the search function in the Workflow List to quickly find a specific workflow by name or ID.</p>
          </div>
        `,
        videoUrl: 'https://example.com/videos/finding-workflows.mp4'
      },
      {
        title: 'Completing Tasks',
        content: `
          <h3>Completing Tasks in Workflows</h3>
          <p>Tasks are the individual actions that need to be completed within a workflow.</p>
          
          <h4>Finding Your Tasks</h4>
          <p>There are several ways to find tasks assigned to you:</p>
          <ul>
            <li>On the dashboard, check the "My Tasks" section</li>
            <li>In a workflow, look for tasks with your name as the assignee</li>
            <li>Use the "My Tasks" view in the left sidebar</li>
          </ul>
          
          <h4>Task Details</h4>
          <p>When you open a task, you'll see:</p>
          <ul>
            <li>Task description and instructions</li>
            <li>Due date and priority</li>
            <li>Required inputs and expected outputs</li>
            <li>Related documents or references</li>
            <li>Comments from other users</li>
          </ul>
          
          <h4>Completing a Task</h4>
          <ol>
            <li>Review the task requirements and instructions</li>
            <li>Perform the required actions:
              <ul>
                <li>Upload documents if required</li>
                <li>Enter data in the provided forms</li>
                <li>Review and approve content</li>
                <li>Make necessary calculations or validations</li>
              </ul>
            </li>
            <li>Add comments if needed to provide context or explanations</li>
            <li>Click the "Complete Task" button</li>
          </ol>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Important:</p>
            <p>Once you mark a task as complete, it may not be possible to reopen it without administrator intervention. Make sure you've fulfilled all requirements before completing a task.</p>
          </div>
        `,
        videoUrl: 'https://example.com/videos/completing-tasks.mp4',
        resources: [
          {
            title: 'Task Completion Checklist',
            description: 'A checklist to ensure proper task completion',
            url: 'https://example.com/docs/task-checklist.pdf'
          }
        ]
      },
      {
        title: 'Monitoring Workflow Progress',
        content: `
          <h3>Monitoring Workflow Progress</h3>
          <p>Keeping track of workflow progress is essential for ensuring timely completion.</p>
          
          <h4>Workflow Progress Indicators</h4>
          <p>STEPS provides several ways to monitor progress:</p>
          <ul>
            <li><strong>Progress Bar:</strong> Shows overall completion percentage</li>
            <li><strong>Stage Status:</strong> Indicates which stages are complete, in progress, or not started</li>
            <li><strong>Timeline View:</strong> Displays planned vs. actual progress</li>
            <li><strong>SLA Indicators:</strong> Highlights if the workflow is on track, at risk, or overdue</li>
          </ul>
          
          <h4>Workflow Detail View</h4>
          <p>For detailed monitoring, use the Workflow Detail View:</p>
          <ol>
            <li>Navigate to the workflow you want to monitor</li>
            <li>Review the workflow stages and their status</li>
            <li>Check for any bottlenecks or delays</li>
            <li>View the activity log for recent updates</li>
            <li>Monitor SLA compliance</li>
          </ol>
          
          <h4>Reporting Issues</h4>
          <p>If you identify a problem that could impact workflow completion:</p>
          <ol>
            <li>Click the "Report Issue" button in the workflow detail view</li>
            <li>Select the issue type and priority</li>
            <li>Provide a detailed description</li>
            <li>Submit the issue to alert the support team</li>
          </ol>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Best Practice:</p>
            <p>Regularly check workflow progress, especially for critical processes, to identify and address potential delays early.</p>
          </div>
        `,
        resources: [
          {
            title: 'Workflow Monitoring Guide',
            description: 'Detailed guide on tracking workflow progress',
            url: 'https://example.com/docs/monitoring-guide.pdf'
          }
        ]
      }
    ]
  },
  {
    id: 'finance-dashboard',
    title: 'Mastering the Finance Dashboard',
    description: 'Learn how to use the Finance Dashboard for financial insights',
    level: 'Intermediate',
    duration: '30 minutes',
    thumbnailUrl: '/images/rect.png',
    categories: ['Dashboards', 'Finance', 'Data Analysis'],
    steps: [
      {
        title: 'Finance Dashboard Overview',
        content: `
          <h3>Finance Dashboard Overview</h3>
          <p>The Finance Dashboard provides real-time visualizations and insights into your financial data and processes.</p>
          
          <h4>Accessing the Dashboard</h4>
          <p>You can access the Finance Dashboard in two ways:</p>
          <ul>
            <li>From the left sidebar menu under "Main" > "Finance Dashboard"</li>
            <li>From a workflow detail page by clicking the "Finance Dashboard" button</li>
          </ul>
          
          <h4>Dashboard Components</h4>
          <p>The Finance Dashboard consists of:</p>
          <ul>
            <li><strong>View Controls:</strong> Toggle between Tile, Split, and Full views</li>
            <li><strong>Tiles:</strong> Individual visualizations of financial data</li>
            <li><strong>Data Grid/Pivot Grid:</strong> Detailed data tables (in Split and Full views)</li>
            <li><strong>Filters:</strong> Controls to focus on specific data segments</li>
            <li><strong>Refresh Controls:</strong> Options to update the data</li>
          </ul>
          
          <h4>Context-Aware Navigation</h4>
          <p>The dashboard behaves differently based on how you access it:</p>
          <ul>
            <li>When accessed directly from the menu, it shows application and workflow dropdowns</li>
            <li>When accessed from a workflow, it shows data specific to that workflow and displays a back button</li>
          </ul>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Key Feature:</p>
            <p>The Finance Dashboard is highly interactive, allowing you to drill down into data, filter information, and customize your view for optimal analysis.</p>
          </div>
        `,
        videoUrl: 'https://example.com/videos/finance-dashboard-overview.mp4'
      },
      {
        title: 'Working with Dashboard Views',
        content: `
          <h3>Working with Dashboard Views</h3>
          <p>The Finance Dashboard offers three main views to suit different analysis needs.</p>
          
          <h4>Tile View</h4>
          <p>The default view showing all tiles in a responsive grid:</p>
          <ul>
            <li>Provides a comprehensive overview of all financial metrics</li>
            <li>Tiles automatically resize based on screen size</li>
            <li>Ideal for getting a broad picture of financial performance</li>
            <li>Each tile can be individually expanded for a closer look</li>
          </ul>
          
          <h4>Split View</h4>
          <p>Shows a main visualization on the left and smaller tiles on the right:</p>
          <ul>
            <li>Main tile provides detailed focus on a primary metric</li>
            <li>Side tiles show related or supporting metrics</li>
            <li>Data grid/pivot grid appears below for detailed analysis</li>
            <li>Perfect for focused analysis while maintaining context</li>
          </ul>
          
          <h4>Full View</h4>
          <p>Dedicates the entire screen to a single visualization:</p>
          <ul>
            <li>Maximizes screen space for detailed analysis of one metric</li>
            <li>Includes controls to switch between different tiles</li>
            <li>Data grid/pivot grid appears below the visualization</li>
            <li>Ideal for in-depth analysis or presentations</li>
          </ul>
          
          <h4>Switching Between Views</h4>
          <ol>
            <li>Locate the view toggle buttons at the top of the dashboard</li>
            <li>Click on the desired view (Tile, Split, or Full)</li>
            <li>The dashboard will immediately switch to the selected view</li>
          </ol>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Tip:</p>
            <p>Use Tile View for a quick overview, Split View for balanced analysis, and Full View when you need to focus on a specific metric in detail.</p>
          </div>
        `,
        videoUrl: 'https://example.com/videos/dashboard-views.mp4'
      },
      {
        title: 'Interacting with Tiles',
        content: `
          <h3>Interacting with Dashboard Tiles</h3>
          <p>Dashboard tiles are interactive elements that display financial data in various formats.</p>
          
          <h4>Tile Types</h4>
          <p>The dashboard includes various tile types:</p>
          <ul>
            <li><strong>Bar Charts:</strong> For comparing values across categories</li>
            <li><strong>Line Charts:</strong> For showing trends over time</li>
            <li><strong>Pie Charts:</strong> For displaying proportions of a whole</li>
            <li><strong>Progress Indicators:</strong> For showing completion or target achievement</li>
            <li><strong>KPI Cards:</strong> For highlighting key performance indicators</li>
            <li><strong>Data Tables:</strong> For presenting detailed numerical data</li>
          </ul>
          
          <h4>Tile Actions</h4>
          <p>Each tile offers several interactive features:</p>
          <ul>
            <li><strong>Expand:</strong> Click the expand icon to view the tile in full-screen mode</li>
            <li><strong>Pin:</strong> Pin important tiles to keep them visible in all views</li>
            <li><strong>Refresh:</strong> Manually refresh the data in a specific tile</li>
            <li><strong>Download:</strong> Export the tile data as CSV or the visualization as an image</li>
            <li><strong>Configure:</strong> (Admin only) Modify the tile's settings and data source</li>
          </ul>
          
          <h4>Data Interaction</h4>
          <p>Within each tile, you can interact with the data:</p>
          <ul>
            <li>Hover over data points to see detailed values</li>
            <li>Click on segments in charts to filter or highlight related data</li>
            <li>Use zoom controls on time-series charts to focus on specific periods</li>
            <li>Sort data tables by clicking on column headers</li>
          </ul>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Advanced Tip:</p>
            <p>Many tiles support cross-filtering: clicking on a data point in one tile will filter related data in other tiles, allowing for powerful interactive analysis.</p>
          </div>
        `,
        resources: [
          {
            title: 'Tile Interaction Guide',
            description: 'Detailed guide on working with dashboard tiles',
            url: 'https://example.com/docs/tile-interaction.pdf'
          }
        ]
      },
      {
        title: 'Configuring Dashboard Tiles',
        content: `
          <h3>Configuring Dashboard Tiles</h3>
          <p>STEPS allows you to customize the Finance Dashboard by configuring its tiles.</p>
          
          <h4>Accessing Tile Configuration</h4>
          <ol>
            <li>Navigate to Finance > Configure</li>
            <li>The Tile Configurator interface will open</li>
          </ol>
          
          <h4>Managing Tiles</h4>
          <p>In the Tile Configurator, you can:</p>
          <ul>
            <li><strong>Add Tiles:</strong> Click "Add Tile" to create a new visualization</li>
            <li><strong>Remove Tiles:</strong> Click the delete icon on a tile to remove it</li>
            <li><strong>Reorder Tiles:</strong> Drag and drop tiles to change their order</li>
            <li><strong>Activate/Deactivate:</strong> Toggle tiles on or off without deleting them</li>
          </ul>
          
          <h4>Configuring Individual Tiles</h4>
          <p>For each tile, you can configure:</p>
          <ul>
            <li><strong>Name:</strong> Set a descriptive title for the tile</li>
            <li><strong>Type:</strong> Select the visualization type (bar, line, pie, etc.)</li>
            <li><strong>Data Source:</strong> Choose the data source for the tile</li>
            <li><strong>Dimensions:</strong> Select the categories or groupings</li>
            <li><strong>Measures:</strong> Choose the values to display</li>
            <li><strong>Filters:</strong> Apply default filters to the data</li>
            <li><strong>Appearance:</strong> Customize colors, labels, and other visual elements</li>
          </ul>
          
          <h4>Saving Configurations</h4>
          <p>After making changes:</p>
          <ol>
            <li>Click "Save Configuration" to persist your changes</li>
            <li>Your customized dashboard will be available immediately</li>
            <li>Configurations are saved to your user profile and will persist across sessions</li>
          </ol>
          
          <div class="bg-muted p-4 rounded-md my-4">
            <p class="font-medium">Note:</p>
            <p>Dashboard configurations are user-specific. Each user can customize their own view of the Finance Dashboard without affecting others.</p>
          </div>
        `,
        videoUrl: 'https://example.com/videos/configuring-tiles.mp4',
        resources: [
          {
            title: 'Tile Configuration Reference',
            description: 'Complete reference for tile configuration options',
            url: 'https://example.com/docs/tile-config-reference.pdf'
          }
        ]
      }
    ]
  }
];