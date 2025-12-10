# Licensing Notes for Clinical Instruments

This project contains implementations for several clinical screening tools. Many of these tools are proprietary and require licensing for distribution or clinical use.

In this repository we include example and placeholder instrument contents; before using or publishing the instruments in production, ensure you obtain the appropriate license from the authors/publishers and configure the platform accordingly.

- MCMI-IV: Licensed (Pearson). Replace demo items with the licensed instrument if you have approval.
- SCID-5-RV: DSM-5 instrument and resources are protected. Use the official manual and procedures with licensed access.
- SCL-90-R, STAI: Many translations and items might be copyrighted or require permission to use.

How to enable licensed instruments:
1. Add a `UserTestLicense` entry (Admin) to grant specific users access to instruments that have `requires_license` set.
2. Confirm that `TestModule.requires_license` is set to `True` for licensed instruments in the initializer or via the admin UI.
3. Update `license_info` with the details of the license and contact details for verification.

Legal: This repo is not legal advice. Consult the instrument's publisher for licensing terms and legal compliance.
