# FB Account Behaviour Review (Research Demo)

A Tampermonkey userscript prototype for demonstrating explainable suspicious-activity scoring with synthetic records.

## Safety and scope

- Evaluates only the four synthetic records bundled in the script.
- Does not inspect Facebook profiles, comments, friends, messages, or other account data.
- Does not call Facebook Graph/API endpoints.
- Does not report, ban, unban, block, or otherwise affect Facebook accounts.
- A risk score is a review signal for a controlled experiment, not proof of misconduct.

## Install for local testing

1. Install the Tampermonkey browser extension.
2. Open the [userscript file](./fb-account-review.user.js) in this repository.
3. Copy its complete contents.
4. Open Tampermonkey Dashboard, choose **Create a new script**, replace the editor contents, and save.
5. Open Facebook and refresh. A **Research review demo** button should appear at the bottom-right.
6. Open the panel and select each TEST-00x record to see its score and explanation.

## Scoring rules in version 1

| Synthetic signal | Points |
| --- | ---: |
| 5 or more repeated messages | 30 |
| 10 or more messages in 10 minutes | 25 |
| 5 or more repeated links | 25 |
| 2 or more independently verified reports | 20 |

The score is capped at 100. Levels are Low (0–29), Review (30–59), and High (60–100).

## Project files

- fb-account-review.user.js — browser userscript and local scoring demonstration.

## Next development steps

1. Add unit tests for the scoring function.
2. Add configurable thresholds and a labelled evaluation dataset.
3. Measure false positives and false negatives before drawing conclusions.
4. Keep any future real-world moderation workflow human-reviewed and restricted to authorized group administration tools.
