# Threat Model: Influence Operations (IO) & Cognitive Security

## Overview
This document outlines the threat landscape for Cognitive Security, specifically focusing on Influence Operations (IO). Unlike traditional cybersecurity which targets data integrity and availability, IO targets the **human decision-making process** through emotional priming, disinformation, and narrative control.

## Threat Actors
1. **State-Sponsored Entities**: Well-resourced actors using coordinated "troll farms" and automated bots to shift public opinion.
2. **Hyper-Partisan Media**: Outlets that prioritize engagement (via outrage) over factual accuracy.
3. **Automated Bots**: Algorithms designed to amplify specific "high-velocity" keywords to manipulate trending topics.

## Attack Vectors
### 1. Emotional Priming
The use of "Outrage Keywords" (e.g., *Slammed*, *Explodes*, *Terrifying*) to bypass the prefrontal cortex and trigger a limbic system response. This makes the target more susceptible to biased information.

### 2. Surveillance Hubs
Disinformation sites often serve as tracking hubs, using aggressive fingerprinting and tracking pixels to build profiles for micro-targeting.

### 3. Narrative Saturation
Repeated exposure to a single narrative across multiple "independent" sites to create an illusion of consensus (The Illusory Truth Effect).

## Defensive Posture (Propaganda Nuke)
The framework employs a multi-layered defense:
- **Keyword Heuristic**: Local counts of user-configured terms; no sentiment model or intent attribution.
- **Radiation Shield**: Removal of named query parameters and two request-blocking patterns; partial tracking reduction, not comprehensive prevention.
- **Local Incident Record**: Bounded page-pause and domain-override logs with unkeyed SHA-256 checksums. Editable records do not establish authenticity or actor attribution.
- **Enterprise Controls**: Centralized policy enforcement via Managed Storage (GPO).
