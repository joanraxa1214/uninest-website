# Uninest Hostel Management System - System Flowchart

The following flowchart illustrates the complete operational workflow of the Uninest Hostel Management System, from user authentication to daily management tasks like room allocation and financial tracking.

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#f96,stroke:#333,stroke-width:2px,color:#000;
    classDef process fill:#bbf,stroke:#333,stroke-width:2px,color:#000;
    classDef decision fill:#ff9,stroke:#333,stroke-width:2px,color:#000;
    classDef database fill:#dfd,stroke:#333,stroke-width:2px,color:#000;

    A([Start System / Web App Open]) ::: startEnd --> B{Is User Logged In?} ::: decision
    
    B -- No --> C[Enter Admin/Manager Credentials] ::: process
    C --> D{Authentication Valid?} ::: decision
    D -- No --> C
    D -- Yes --> E[Access Main Dashboard] ::: process
    B -- Yes --> E

    E --> F{Select Module from Sidebar} ::: decision

    %% -------------------------
    %% Student Management Flow
    %% -------------------------
    F -- Manage Students --> G[Open Student Directory] ::: process
    G --> H{Action Type} ::: decision
    H -- View/Edit --> I[Update Student Details] ::: process
    H -- Add New --> J[Register New Student Data] ::: process
    J --> K[(Save to DB: Students Table)] ::: database

    %% -------------------------
    %% Room Allocation Flow
    %% -------------------------
    F -- Room Allocation --> L[Select Student & Room Type] ::: process
    L --> M{Is Room Available?} ::: decision
    M -- No --> N[Show Error: Room Full] ::: process
    N --> L
    M -- Yes --> O[Assign Bed to Student] ::: process
    O --> P[(Save to DB: Allocations Table)] ::: database

    %% -------------------------
    %% Financial Flow (Payments)
    %% -------------------------
    F -- Collect Fees --> Q[Select Student & Amount] ::: process
    Q --> R[Select Payment Method & Account] ::: process
    R --> S[Log Payment] ::: process
    S --> T[(Save to DB: Payments Table)] ::: database
    T -. Trigger Auto-Fire .-> U[(Update DB: Add to Transactions & Accounts Balance)] ::: database

    %% -------------------------
    %% Financial Flow (Expenses)
    %% -------------------------
    F -- Log Expense --> V[Enter Expense Details & Amount] ::: process
    V --> W[Select Account to Deduct From] ::: process
    W --> X[(Save to DB: Expenses Table)] ::: database
    X -. Trigger Auto-Fire .-> Y[(Update DB: Add to Transactions & Deduct Accounts Balance)] ::: database

    %% -------------------------
    %% Inquiries Flow
    %% -------------------------
    F -- Inquiries --> Z[Log Prospective Student Inquiry] ::: process
    Z --> AA[(Save to DB: Inquiries Table)] ::: database

    %% End points mapping back to dashboard
    I --> E
    K --> E
    P --> E
    U --> E
    Y --> E
    AA --> E
    
    E --> AB([Logout / End Session]) ::: startEnd
```
