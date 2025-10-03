# spec.md: Creator Approval Gate n8n Workflow

## 1.0 Feature Overview
This document specifies the logic for the "Creator Approval Gate," an n8n workflow that manages the approval process when a participant (who is not the original creator) invites a new user to a dispute.

## 2.0 Strategic Objective
To enforce the business rule defined in `Disagreement.AI MVP` (Section III): "If User B (a participant) invites User C, User A (the creator) must approve User C." This maintains the creator's control over the dispute.

## 3.0 Workflow Trigger
- **Type**: Webhook
- **Name**: `Initial Invite Trigger`
- **Mechanism**: The backend server will call this webhook via a POST request whenever a non-creator invites a new user.
- **Expected JSON Payload**:
  ```json
  {
    "disputeId": "d_12345abc",
    "creatorId": "u_creator_xyz",
    "inviterName": "John Doe",
    "inviteeEmail": "new.user@example.com"
  }  ```