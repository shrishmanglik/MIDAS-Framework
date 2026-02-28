"""
Ontario Employment Standards Act (ESA) 2000 — key rules for seeding.

Source: https://www.ontario.ca/document/your-guide-employment-standards-act-0
These reflect standards current as of 2024.
"""

EMPLOYMENT_STANDARDS: list[dict] = [
    # ── Minimum Wage ──────────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "minimum_wage",
        "rule_text": "The general minimum wage in Ontario is $16.55 per hour (effective October 1, 2023). Student minimum wage is $15.60 per hour.",
        "effective_date": "2023-10-01",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/minimum-wage",
    },
    {
        "province": "Ontario",
        "topic": "minimum_wage",
        "rule_text": "Liquor servers minimum wage is $15.60 per hour. Homeworkers minimum wage is $18.20 per hour (110% of general minimum wage).",
        "effective_date": "2023-10-01",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/minimum-wage",
    },
    {
        "province": "Ontario",
        "topic": "minimum_wage",
        "rule_text": "Hunting, fishing and wilderness guides: $82.85 per day (less than 5 consecutive hours), $165.75 per day (5 or more hours).",
        "effective_date": "2023-10-01",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/minimum-wage",
    },
    # ── Vacation ──────────────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "vacation",
        "rule_text": "Employees earn a minimum of 2 weeks vacation after each 12-month vacation entitlement year. Vacation pay is at least 4% of gross wages earned in the vacation entitlement year.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/vacation",
    },
    {
        "province": "Ontario",
        "topic": "vacation",
        "rule_text": "After 5 or more years of employment, employees earn a minimum of 3 weeks vacation. Vacation pay increases to at least 6% of gross wages.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/vacation",
    },
    {
        "province": "Ontario",
        "topic": "vacation",
        "rule_text": "Vacation must be taken in a complete week or day period unless the employee and employer agree to an alternative arrangement in writing.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/vacation",
    },
    # ── Overtime ──────────────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "overtime",
        "rule_text": "Most employees are entitled to overtime pay at 1.5 times their regular rate after working 44 hours in a work week.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/overtime-pay",
    },
    {
        "province": "Ontario",
        "topic": "overtime",
        "rule_text": "An employer and employee can agree in writing to an averaging arrangement for overtime purposes, but the average must not exceed 44 hours per week over the agreed period.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/overtime-pay",
    },
    {
        "province": "Ontario",
        "topic": "overtime",
        "rule_text": "Employers can provide paid time off in lieu of overtime pay if there is a written agreement. The time off must be at 1.5 hours for each overtime hour worked.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/overtime-pay",
    },
    {
        "province": "Ontario",
        "topic": "overtime",
        "rule_text": "Certain employees are exempt from overtime, including managers and supervisors (whose work is supervisory or managerial in character), IT professionals, and certain regulated professionals.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/overtime-pay",
    },
    # ── Public Holidays ───────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "public_holidays",
        "rule_text": "Ontario has 9 public holidays: New Year's Day, Family Day, Good Friday, Victoria Day, Canada Day, Labour Day, Thanksgiving Day, Christmas Day, and Boxing Day.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/public-holidays",
    },
    {
        "province": "Ontario",
        "topic": "public_holidays",
        "rule_text": "Most employees are entitled to take public holidays off work and receive public holiday pay. Public holiday pay is calculated as total regular wages earned plus vacation pay in the 4 work weeks before the holiday, divided by 20.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/public-holidays",
    },
    {
        "province": "Ontario",
        "topic": "public_holidays",
        "rule_text": "If an employee agrees to work on a public holiday, they are entitled to either premium pay (1.5 times regular rate for hours worked plus public holiday pay) or their regular rate plus a substitute day off with public holiday pay.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/public-holidays",
    },
    # ── Termination Notice ────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "termination_notice",
        "rule_text": "Employers must give written notice of termination or pay in lieu: 1 week (employed 3 months to 1 year), 2 weeks (1-3 years), 3 weeks (3-4 years), 4 weeks (4-5 years), 5 weeks (5-6 years), 6 weeks (6-7 years), 7 weeks (7-8 years), 8 weeks (8+ years).",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/termination-employment",
    },
    {
        "province": "Ontario",
        "topic": "termination_notice",
        "rule_text": "Employees with 3 or more months of employment must give at least 1 week written notice of resignation (unless the contract says otherwise or the employee has been constructively dismissed).",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/termination-employment",
    },
    {
        "province": "Ontario",
        "topic": "termination_notice",
        "rule_text": "Severance pay is required if the employer has a payroll of $2.5 million or more, or if 50+ employees are being terminated within a 6-month period. Severance is 1 week per year of employment, up to 26 weeks.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/severance-pay",
    },
    {
        "province": "Ontario",
        "topic": "termination_notice",
        "rule_text": "An employer can terminate without notice or pay in lieu for willful misconduct, disobedience, or willful neglect of duty that is not trivial and has not been condoned by the employer.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/termination-employment",
    },
    # ── Parental Leave ────────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "parental_leave",
        "rule_text": "Pregnancy leave: Up to 16 weeks of unpaid, job-protected leave. Must have been employed for at least 13 weeks. Can start up to 17 weeks before the expected due date.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/pregnancy-and-parental-leave",
    },
    {
        "province": "Ontario",
        "topic": "parental_leave",
        "rule_text": "Parental leave: Up to 61 weeks of unpaid, job-protected leave for birth parents who took pregnancy leave, or up to 63 weeks for all other new parents. Must have been employed for at least 13 weeks.",
        "effective_date": "2019-01-01",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/pregnancy-and-parental-leave",
    },
    {
        "province": "Ontario",
        "topic": "parental_leave",
        "rule_text": "Parental leave must begin within 78 weeks of the child's birth or the date the child first came into the parent's custody (adoption). The employee's job is protected during the leave.",
        "effective_date": "2019-01-01",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/pregnancy-and-parental-leave",
    },
    # ── Hours of Work ─────────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "hours_of_work",
        "rule_text": "The maximum number of hours most employees can be required to work is 8 hours a day or the number of hours in the employee's established regular work day, whichever is greater.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/hours-work",
    },
    {
        "province": "Ontario",
        "topic": "hours_of_work",
        "rule_text": "The maximum work week is 48 hours unless the employee has a written agreement to work more and the employer has Ministry of Labour approval (or the agreement meets certain conditions).",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/hours-work",
    },
    {
        "province": "Ontario",
        "topic": "hours_of_work",
        "rule_text": "Employees must receive at least 11 consecutive hours off work each day and at least 8 hours between shifts (or the number of hours between the end of one shift and the beginning of the next).",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/hours-work",
    },
    # ── Eating Periods ────────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "eating_periods",
        "rule_text": "Employees must receive a 30-minute eating period (meal break) for every 5 consecutive hours of work. This break must be free from work, though the employer and employee can agree to split it into two shorter breaks.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/hours-work",
    },
    # ── Equal Pay ─────────────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "equal_pay",
        "rule_text": "Employers must not pay an employee at a rate less than another employee of a different sex when they perform substantially the same kind of work in the same establishment. Differences based on seniority, merit, or productivity systems are permitted.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/equal-pay-equal-work",
    },
    {
        "province": "Ontario",
        "topic": "equal_pay",
        "rule_text": "Employers must not pay a temporary help agency employee a lower rate than a permanent employee of the client performing substantially the same work. Differences based on seniority or merit systems are permitted.",
        "effective_date": "2018-01-01",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/equal-pay-equal-work",
    },
    # ── Sick Leave ────────────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "sick_leave",
        "rule_text": "Employees who have been employed for at least 2 consecutive weeks are entitled to a minimum of 3 days of unpaid, job-protected sick leave per calendar year.",
        "effective_date": "2022-04-29",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/sick-leave",
    },
    # ── Bereavement Leave ─────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "bereavement_leave",
        "rule_text": "Employees who have been employed for at least 2 consecutive weeks are entitled to 2 days of unpaid bereavement leave per calendar year for the death of specified family members.",
        "effective_date": "2018-01-01",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/bereavement-leave",
    },
    # ── Record Keeping ────────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "record_keeping",
        "rule_text": "Employers must keep records for each employee for at least 3 years after the employee stops working. Records must include: name, address, date of birth, start date, hours worked each day and week, vacation time and pay, and wages paid.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/record-keeping",
    },
    # ── Temporary Layoff ──────────────────────────────────────
    {
        "province": "Ontario",
        "topic": "temporary_layoff",
        "rule_text": "A temporary layoff cannot exceed 13 weeks in any period of 20 consecutive weeks. If the layoff exceeds this, it is considered a termination and the employee is owed termination entitlements.",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/termination-employment",
    },
    {
        "province": "Ontario",
        "topic": "temporary_layoff",
        "rule_text": "A temporary layoff can extend up to 35 weeks in any period of 52 consecutive weeks if certain conditions are met (e.g., employer continues benefit contributions, employee receives supplementary unemployment benefits, or employee is recalled within the time frame).",
        "effective_date": "2000-09-04",
        "source_url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/termination-employment",
    },
]
