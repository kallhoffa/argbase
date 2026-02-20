ADR-001: Argument Hierarchy and Classification Model

Date: 2025-11-12
Status: Proposed

Context

ArgBase requires a system to organize arguments, claims, and evidence. This system must represent the logical relationships between arguments (e.g., "A supports B," "C refutes D"). The README outlines core features like "Hierarchical organization of arguments" and "Smart search."

Based on the project goals, this structure must meet three key design considerations:

Scalable Linkage Searching: Querying the relationships between arguments (traversing the "tree" or "graph") must be performant, even as the dataset grows to millions of arguments.

Flexible & Atomic Edits: We must be able to insert new arguments or remove existing ones without invalidating the entire logical structure. Removing a single "link" (e.g., A no longer supports B) should not delete argument A or B.

Topical Classification: The system must allow for a separate, browsable classification of all topics, similar to a library system (like the Dewey Decimal System), independent of the logical argument structure.

Decision Drivers

Simple Trees (parent_id): A simple tree model (where an argument has one parent_id) fails. An argument can support multiple "parent" claims, and it can be both a "parent" (supporting other claims) and a "child" (being supported by evidence) simultaneously. Removing a parent node would orphan an entire branch, violating the flexibility requirement.

Logical vs. Topical Hierarchy: The logical flow of an argument (A -> B -> C) is a different data structure from the topical classification of A, B, and C (e.g., A is "Economics," B is "Sociology," C is "Economics"). We must be able to model both.

Performance: Graph traversal (finding all supporting/refuting arguments) is a core function. The data model must be optimized for this, either in a relational DB or a dedicated graph DB.

Considered Options

Option 1: Simple Tree Model (Rejected)

Description: Each argument has a single parent_id column, forming a strict tree.

Pros: Simple to implement and query.

Cons:

Fails to model reality: An argument can support multiple conclusions.

Fails flexibility: Removing a node breaks an entire sub-tree.

Fails flexibility: Cannot represent "A refutes B."

Option 2: Adjacency List (Relational)

Description: Each argument is a row. A links column stores a JSON array of related argument IDs (e.g., {"supports": [12, 14], "refutes": [15]}).

Pros: Keeps data co-located.

Cons:

Violates database normalization.

Extremely difficult to query from the "reverse" (e.g., "What arguments link to this one?").

Poor search performance; cannot index array contents.

Option 3: Decoupled Graph Model (Nodes & Edges)

Description: We model the system as a Directed Acyclic Graph (DAG).

Nodes (Arguments): An arguments table. Each argument is a standalone row (id, content, metadata).

Edges (Links): A separate links table (id, source_argument_id, target_argument_id, type). The type enum would be SUPPORTS, REFUTES, RELATED_TO.

Taxonomy (Classification): A separate hierarchical categories table (id, name, code, parent_id) to model the "Dewey Decimal" structure.

Join Table: A many-to-many argument_categories table (argument_id, category_id) to tag arguments with one or more topics.

Decision

We will implement Option 3: Decoupled Graph Model (Nodes & Edges).

This architecture explicitly separates the Argument (Node) from its Relationships (Edges) and its Topic (Category).

arguments Table (Nodes):

id (PK)

statement (text, the argument/claim itself)

description (text, further explanation)

...other metadata

links Table (Edges):

id (PK)

source_argument_id (FK to arguments.id)

target_argument_id (FK to arguments.id)

type (Enum: SUPPORTS, REFUTES, RELATED_TO, EVIDENCE_FOR)

categories Table (Taxonomy Tree):

id (PK)

parent_id (FK to categories.id, nullable for root)

name (e.g., "Ethics", "Applied Ethics")

code (e.g., "170", "174")

argument_categories Table (Join):

argument_id (FK to arguments.id)

category_id (FK to categories.id)

Consequences

Positive

Addresses Scalability:

Searching linkages is a performant query on the indexed links table.

This model is the standard for graph operations and can be migrated to a dedicated Graph Database (like Neo4j) if relational performance becomes a bottleneck, with no change to the application logic's concept.

Addresses Flexibility:

Inserting: A new argument is just a new row in the arguments table. It doesn't need to be linked to anything.

Linking: A new relationship is just a new row in the links table.

Removing:

To remove an argument, we delete its row and cascade delete from links and argument_categories. The rest of the graph is unaffected.

To remove a relationship (e.g., "A no longer supports B"), we only delete the corresponding row from the links table. Both arguments A and B continue to exist.

Addresses Classification:

The "Dewey Decimal" requirement is met perfectly by the separate categories table, which can be browsed as its own hierarchy.

An argument can be classified under multiple topics (e.g., an argument about "AI Ethics" could be tagged in "AI" and "Ethics").

Negative

Implementation Complexity: This is more complex than a simple parent_id model. Queries to construct a "full" argument view require JOINs across arguments and links.

Cycle Prevention: The application logic must prevent cyclical relationships (e.g., A supports B, and B supports A). This must be handled before inserting into the links table. The graph should be a Directed Acyclic Graph (DAG).