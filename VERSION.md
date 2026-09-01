# Version History

## V1.2.1 — Google Drive Media URL Support

Current version: **V1.2.1**

This patch release fixes Google Drive image rendering by detecting Drive share links and converting them to public thumbnail URLs when showing avatar, project thumbnails and case-study gallery images.

### Included
- Google Drive file ID detection
- Support for `/file/d/FILE_ID/view`, `open?id=FILE_ID`, `uc?id=FILE_ID` and bare Drive file IDs
- Public image rendering via `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600`
- Admin avatar preview uses normalized Drive preview URL
- Admin project thumbnail preview uses normalized Drive preview URL
- Public Hero avatar uses normalized media URL
- Public Project cards use normalized media URL
- Project case-study hero and gallery use normalized media URL
- Resume/CV links use a normalized Google Drive view URL
- JSON-LD image/media URLs use normalized media URLs
- `next.config.ts` allows Google media hostnames for future Next Image usage
- Admin help text explains Google Drive permission requirement

### Version sync
- `package.json` version updated to `1.2.1`
- `src/data/version.ts` label updated to `V1.2.1`
- Admin storage/session keys updated to V1.2.1
- README and deployment docs updated to V1.2.1

## Notes

Google Drive images must be shared as:

```text
Share → General access → Anyone with the link → Viewer
```

If the image is still broken after this patch, the most likely cause is private Drive permission or a non-image file being used as an image preview.
