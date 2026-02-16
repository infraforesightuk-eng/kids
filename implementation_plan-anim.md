# Update Animation Section for Ages 16 and Below

This task involves renaming the "16+" animation section to "Pure Animation" and ensuring the content is filtered to be appropriate for ages 16 and below.

## Proposed Changes

### Frontend Components

#### [MODIFY] [index.html](file:///home/brett/kids/html/index.html)

- Change the heading from `16+` to `Pure Animation`.
- Update the section label to be more descriptive of the content (Animation for all ages).

#### [MODIFY] [home.js](file:///home/brett/kids/html/src/home.js)

- Update code comments and logging from "ANIME" to "ANIMATION".
- Refine the TMDB `discover/tv` query to include age-appropriate filters.
- Currently, it fetches `with_genres=16`. I will add `&certification_country=US&certification.lte=PG-13` to favor content for ages 16 and below.

#### [MODIFY] [see-all.js](file:///home/brett/kids/html/src/see-all.js)

- Update the title in the `categories` object from `'16+ Animation'` to `'Pure Animation'`.
- Synchronize the API query parameters with those used in `home.js`.
- Implement logic to handle the new age filter by adding `certification_country=US` and `certification.lte` to the TMDB query.

#### [MODIFY] [seeall.html](file:///home/brett/kids/html/seeall.html)

- Add a new "Age Limit" dropdown filter in the advanced filters section.
- Options will include: "All Ages (G)", "Ages 7+ (PG)", "Ages 13+ (PG-13)", "Ages 16+ (R/TV-MA)".

## Verification Plan

### Manual Verification

- Open the homepage and verify the section is now labeled "Pure Animation".
- Click "See All" in that section and verify the title on the new page is "Pure Animation".
- Verify that the content displayed in the section is animation suitable for ages 16 and below.
