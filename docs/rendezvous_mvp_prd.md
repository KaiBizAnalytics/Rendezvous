# MVP Product Requirements Document (PRD)

## Product: Rendezvous -- AI Wedding Concierge

------------------------------------------------------------------------

# 1. Product Overview

Rendezvous is an **AI-powered wedding planning concierge** designed to
help couples quickly find relevant vendors, estimate realistic costs,
and simplify the wedding planning process.

Current wedding planning tools are fragmented across spreadsheets,
vendor websites, social media, and search engines. Couples spend hours
researching options that often turn out to be unrealistic for their
budget, location, or cultural needs.

The MVP will focus on **reducing research time and decision fatigue** by
delivering **personalized vendor recommendations and planning guidance
through an AI concierge interface.**

------------------------------------------------------------------------

# 2. Problem Statement

Wedding planning today suffers from several key problems:

1.  **Vendor research is time-consuming** Couples spend hours browsing
    vendors only to find they exceed their budget or don't match their
    needs.

2.  **Lack of transparent pricing** Vendors rarely display realistic
    price ranges, forcing couples to contact many vendors individually.

3.  **Fragmented planning tools** Couples currently use multiple tools
    (Google Sheets, Pinterest, Instagram, vendor sites) with no central
    hub.

4.  **Decision fatigue** Couples must make hundreds of small planning
    decisions.

5.  **Lack of personalization** Most platforms assume a generic Western
    wedding and do not account for cultural traditions or unique
    constraints.

------------------------------------------------------------------------

# 3. Product Vision

Create a **personalized AI wedding concierge** that:

-   Understands a couple's wedding context
-   Recommends realistic vendors
-   Provides transparent pricing guidance
-   Organizes planning in one place
-   Reduces time spent researching

The long-term goal is to become the **default starting point for wedding
planning**.

------------------------------------------------------------------------

# 4. Target Users

## Primary User Segment

Engaged couples planning weddings in urban markets.

Typical characteristics:

-   Age: 25--40
-   Tech-comfortable
-   Budget-conscious but value convenience
-   Planning weddings between **40--200 guests**

### Key personas identified from interviews

1.  Budget-conscious planners
2.  Highly organized planners managing complex weddings
3.  Multicultural wedding planners
4.  Busy professionals with limited time

------------------------------------------------------------------------

# 5. MVP Goals

The MVP aims to validate the following hypotheses:

1.  Couples prefer **personalized vendor recommendations over browsing
    directories**.
2.  Couples value **price transparency and budget filtering**.
3.  Couples are willing to **interact with an AI concierge for planning
    guidance**.
4.  A centralized tool can **replace fragmented research workflows**.

------------------------------------------------------------------------

# 6. Success Metrics

Primary Metrics:

-   Time to first vendor shortlist
-   \% of users completing onboarding
-   AI concierge interaction rate
-   Vendor shortlist creation rate

Secondary Metrics:

-   User satisfaction with recommendations
-   Weekly active users
-   Vendor click-through rate

------------------------------------------------------------------------

# 7. MVP Scope

## Core Features

### 1. Wedding Intake Questionnaire

Purpose: Collect information needed to personalize recommendations.

Inputs:

-   Wedding location
-   Guest count
-   Budget range
-   Wedding date
-   Cultural requirements
-   Wedding style

Output: Structured wedding profile used by the AI concierge.

------------------------------------------------------------------------

### 2. AI Wedding Concierge Chat

Users can interact with a chatbot to ask questions and receive guidance.

Example queries:

-   "Find venues under \$15k in Vancouver."
-   "What vendors do I need for a Chinese tea ceremony?"
-   "What is a realistic catering budget for 120 guests?"

Capabilities:

-   Vendor recommendations
-   Budget guidance
-   Planning advice
-   Task suggestions

------------------------------------------------------------------------

### 3. Personalized Vendor Recommendations

System generates a curated list of vendors based on the wedding profile.

Vendor categories for MVP:

-   Venues
-   Caterers
-   Photographers
-   Wedding planners

Features:

-   Budget filtering
-   Guest capacity matching
-   Location filtering
-   Cultural compatibility tags

------------------------------------------------------------------------

### 4. Vendor Comparison View

Users can compare shortlisted vendors.

Display:

-   Estimated price range
-   Capacity
-   Key features
-   User notes

------------------------------------------------------------------------

### 5. Basic Wedding Planning Dashboard

Simple dashboard including:

-   Vendor shortlist
-   Budget estimates
-   Task checklist

This replaces basic spreadsheet workflows.

------------------------------------------------------------------------

# 8. Out of Scope (For MVP)

The following features will **not be included in the MVP:**

-   Vendor booking and payments
-   Full budget automation
-   Guest RSVP management
-   Seating charts
-   Detailed timeline builders
-   Multi-event planning workflows

These may be explored in future versions.

------------------------------------------------------------------------

# 9. User Flow

1.  User lands on homepage
2.  User completes wedding intake questionnaire
3.  AI concierge generates recommendations
4.  User chats with concierge to refine results
5.  User saves vendors to shortlist
6.  User compares vendors

------------------------------------------------------------------------

# 10. Technical Approach

Platform: Web application

Core Components:

Frontend - React-based interface

Backend - API server for vendor data and user profiles

AI Layer - LLM-powered concierge for recommendations and Q&A

Data Sources - Vendor database - Pricing estimates - User inputs

------------------------------------------------------------------------

# 11. Risks & Assumptions

Key Risks:

1.  Users may not trust AI recommendations.
2.  Vendor pricing data may be incomplete.
3.  Couples may prefer existing tools like spreadsheets.

Validation experiments should focus on **trust, recommendation accuracy,
and usability.**

------------------------------------------------------------------------

# 12. Future Expansion

Potential future features:

-   Vendor booking platform
-   Budget automation
-   Guest list management
-   Cultural wedding templates
-   Vendor review marketplace
-   Collaborative planning tools for families

------------------------------------------------------------------------

# 13. MVP Summary

The MVP focuses on **solving the most painful early-stage planning
problems:**

-   vendor discovery
-   price transparency
-   decision support

By delivering **personalized vendor recommendations through an AI
concierge**, Rendezvous aims to dramatically reduce wedding planning
time and complexity.
