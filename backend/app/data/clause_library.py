"""
Common contract clause types with descriptions, risk levels, and example text.
Used for contract review analysis and clause detection.
"""

CLAUSE_LIBRARY: list[dict] = [
    {
        "clause_type": "confidentiality",
        "name": "Confidentiality / Non-Disclosure",
        "description": "Restricts parties from sharing proprietary or sensitive information disclosed during the business relationship.",
        "risk_level": "high",
        "example_text": (
            "Each party agrees to hold in strict confidence all Confidential Information received from the other party. "
            "Confidential Information shall not be disclosed to any third party without the prior written consent of the "
            "disclosing party, except as required by law or to employees and advisors who need to know such information "
            "and are bound by confidentiality obligations no less restrictive than those contained herein."
        ),
    },
    {
        "clause_type": "non_compete",
        "name": "Non-Compete",
        "description": "Prevents a party from engaging in competing business activities for a specified period and within a defined geographic area after the relationship ends.",
        "risk_level": "high",
        "example_text": (
            "During the term of this Agreement and for a period of [12/24] months following termination, the Receiving Party "
            "shall not, directly or indirectly, engage in, own, manage, operate, or participate in any business that competes "
            "with the Disclosing Party within [geographic area]. This restriction applies to the specific business activities "
            "that are the subject of this Agreement."
        ),
    },
    {
        "clause_type": "non_solicitation",
        "name": "Non-Solicitation",
        "description": "Prevents a party from soliciting the other party's employees, clients, or customers for a specified period.",
        "risk_level": "medium",
        "example_text": (
            "For a period of [12] months following the termination of this Agreement, neither party shall, directly or "
            "indirectly, solicit, recruit, or hire any employee, contractor, or consultant of the other party, or solicit "
            "or attempt to divert any customer, client, or business opportunity from the other party."
        ),
    },
    {
        "clause_type": "indemnification",
        "name": "Indemnification",
        "description": "Allocates risk by requiring one party to compensate the other for certain losses, damages, or liabilities arising from the agreement.",
        "risk_level": "high",
        "example_text": (
            "Each party (the 'Indemnifying Party') shall indemnify, defend, and hold harmless the other party and its "
            "officers, directors, employees, and agents (collectively, the 'Indemnified Parties') from and against any "
            "and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) "
            "arising out of or related to: (a) any breach of this Agreement by the Indemnifying Party; (b) any negligent "
            "or wrongful act or omission of the Indemnifying Party; or (c) any violation of applicable law."
        ),
    },
    {
        "clause_type": "limitation_of_liability",
        "name": "Limitation of Liability",
        "description": "Caps the maximum amount of damages one party can recover from the other, often excluding consequential or indirect damages.",
        "risk_level": "high",
        "example_text": (
            "IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, "
            "OR PUNITIVE DAMAGES, REGARDLESS OF THE CAUSE OF ACTION OR THE THEORY OF LIABILITY, EVEN IF SUCH PARTY HAS "
            "BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE TOTAL AGGREGATE LIABILITY OF EITHER PARTY SHALL NOT "
            "EXCEED THE TOTAL FEES PAID OR PAYABLE UNDER THIS AGREEMENT DURING THE TWELVE (12) MONTH PERIOD PRECEDING "
            "THE EVENT GIVING RISE TO THE CLAIM."
        ),
    },
    {
        "clause_type": "termination",
        "name": "Termination",
        "description": "Defines the conditions under which the agreement can be ended by either party, including notice requirements and post-termination obligations.",
        "risk_level": "medium",
        "example_text": (
            "Either party may terminate this Agreement: (a) for convenience upon [30/60/90] days' prior written notice to "
            "the other party; (b) immediately upon written notice if the other party materially breaches this Agreement and "
            "fails to cure such breach within [30] days after receipt of written notice; or (c) immediately upon written "
            "notice if the other party becomes insolvent, files for bankruptcy, or has a receiver appointed for its assets."
        ),
    },
    {
        "clause_type": "governing_law",
        "name": "Governing Law and Jurisdiction",
        "description": "Specifies which jurisdiction's laws will govern the agreement and where disputes will be resolved.",
        "risk_level": "medium",
        "example_text": (
            "This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and "
            "the federal laws of Canada applicable therein, without regard to conflict of laws principles. The parties "
            "irrevocably submit to the exclusive jurisdiction of the courts of the Province of Ontario for the resolution "
            "of any disputes arising under or in connection with this Agreement."
        ),
    },
    {
        "clause_type": "intellectual_property",
        "name": "Intellectual Property",
        "description": "Defines ownership, licensing, and usage rights of intellectual property created or shared during the agreement.",
        "risk_level": "high",
        "example_text": (
            "All intellectual property rights in any work product, inventions, discoveries, or improvements created by the "
            "Service Provider in the course of performing services under this Agreement ('Work Product') shall be the sole "
            "and exclusive property of the Client. The Service Provider hereby assigns to the Client all right, title, and "
            "interest in and to the Work Product, including all patents, copyrights, trade secrets, and other intellectual "
            "property rights therein."
        ),
    },
    {
        "clause_type": "force_majeure",
        "name": "Force Majeure",
        "description": "Excuses non-performance when extraordinary events beyond the parties' control prevent fulfillment of obligations.",
        "risk_level": "low",
        "example_text": (
            "Neither party shall be liable for any failure or delay in performing its obligations under this Agreement if "
            "such failure or delay results from circumstances beyond the reasonable control of that party, including but "
            "not limited to: acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military "
            "authorities, fire, floods, epidemics, pandemics, strikes, or power outages. The affected party shall provide "
            "prompt written notice and use reasonable efforts to mitigate the impact."
        ),
    },
    {
        "clause_type": "assignment",
        "name": "Assignment",
        "description": "Governs whether and how parties can transfer their rights and obligations under the agreement to third parties.",
        "risk_level": "low",
        "example_text": (
            "Neither party may assign or transfer this Agreement or any of its rights or obligations hereunder without "
            "the prior written consent of the other party, which consent shall not be unreasonably withheld. "
            "Notwithstanding the foregoing, either party may assign this Agreement to an affiliate or in connection with "
            "a merger, acquisition, or sale of all or substantially all of its assets, provided the assignee agrees in "
            "writing to be bound by the terms of this Agreement."
        ),
    },
    {
        "clause_type": "dispute_resolution",
        "name": "Dispute Resolution",
        "description": "Establishes the process for resolving disagreements, often requiring negotiation, mediation, or arbitration before litigation.",
        "risk_level": "medium",
        "example_text": (
            "In the event of any dispute arising out of or relating to this Agreement, the parties shall first attempt to "
            "resolve the dispute through good faith negotiation. If the dispute is not resolved within [30] days, the "
            "parties agree to submit the dispute to mediation administered by [mediation body]. If mediation is unsuccessful "
            "within [60] days, either party may commence binding arbitration in accordance with the rules of [arbitration body]. "
            "The arbitration shall take place in [city, province] and the decision of the arbitrator shall be final and binding."
        ),
    },
    {
        "clause_type": "entire_agreement",
        "name": "Entire Agreement / Integration",
        "description": "States that the written agreement represents the complete understanding between parties, superseding all prior negotiations and agreements.",
        "risk_level": "low",
        "example_text": (
            "This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof "
            "and supersedes all prior and contemporaneous agreements, understandings, negotiations, and discussions, whether "
            "oral or written, between the parties. No amendment or modification of this Agreement shall be valid or binding "
            "unless made in writing and signed by both parties."
        ),
    },
    {
        "clause_type": "warranty",
        "name": "Representations and Warranties",
        "description": "Statements of fact or promises about the current state of affairs or future performance that each party affirms as true.",
        "risk_level": "medium",
        "example_text": (
            "Each party represents and warrants that: (a) it has the full power and authority to enter into this Agreement; "
            "(b) the execution and performance of this Agreement does not conflict with any other agreement to which it is "
            "a party; (c) it shall comply with all applicable laws, regulations, and industry standards in the performance "
            "of its obligations; and (d) any materials or deliverables provided will not infringe upon the intellectual "
            "property rights of any third party."
        ),
    },
    {
        "clause_type": "payment_terms",
        "name": "Payment Terms",
        "description": "Defines pricing, invoicing, payment schedules, late payment penalties, and any applicable taxes.",
        "risk_level": "medium",
        "example_text": (
            "The Client shall pay the Service Provider the fees set forth in Schedule A. Invoices shall be issued [monthly/upon "
            "completion] and are due within [30] days of receipt. Late payments shall accrue interest at the rate of [1.5%] per "
            "month or the maximum rate permitted by law, whichever is less. All fees are exclusive of applicable taxes, which "
            "shall be the responsibility of the Client."
        ),
    },
    {
        "clause_type": "data_protection",
        "name": "Data Protection and Privacy",
        "description": "Addresses handling, storage, and protection of personal data in compliance with privacy laws such as PIPEDA.",
        "risk_level": "high",
        "example_text": (
            "Each party shall comply with all applicable data protection and privacy laws, including the Personal Information "
            "Protection and Electronic Documents Act (PIPEDA). The Receiving Party shall implement appropriate technical and "
            "organizational measures to protect personal information against unauthorized access, disclosure, alteration, or "
            "destruction. In the event of a data breach involving personal information, the affected party shall notify the "
            "other party within [72] hours and cooperate in any required breach notification procedures."
        ),
    },
]
