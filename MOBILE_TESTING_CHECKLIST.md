# Mobile Testing Checklist - iFind Attorney

**Date:** January 12, 2026  
**Tester:** [Your Name]  
**Status:** Ready for Testing

---

## Device Testing Matrix

### Test on These Devices:

```
┌─────────────────────────────────────────────────────────┐
│  PHONES                                                   │
├─────────────────┬──────────┬──────────┬──────────────────┤
│ Model           │ Screen   │ Browser  │ Status           │
├─────────────────┼──────────┼──────────┼──────────────────┤
│ iPhone SE       │ 375px    │ Safari   │ [ ] Tested       │
│ iPhone 12/13    │ 390px    │ Safari   │ [ ] Tested       │
│ Pixel 4/5       │ 412px    │ Chrome   │ [ ] Tested       │
│ Galaxy S21      │ 360px    │ Chrome   │ [ ] Tested       │
└─────────────────┴──────────┴──────────┴──────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TABLETS                                                  │
├─────────────────┬──────────┬──────────┬──────────────────┤
│ iPad (9th gen)  │ 768px    │ Safari   │ [ ] Tested       │
│ iPad Pro 11"    │ 834px    │ Safari   │ [ ] Tested       │
│ Galaxy Tab      │ 800px    │ Chrome   │ [ ] Tested       │
└─────────────────┴──────────┴──────────┴──────────────────┘
```

---

## Pages to Test

- [ ] Home page (`/`)
- [ ] Form page (`/form`)
- [ ] Results page (`/results`)
- [ ] About page (`/about`)
- [ ] Projects page (`/projects`)
- [ ] Lawyer fees page (`/lawyer-fees`)
- [ ] Creator page (`/creator`)

---

## Critical Tests

### Viewport & Scaling
- [ ] Page displays at correct scale (no zoom needed)
- [ ] Content fits screen width (no horizontal scroll)
- [ ] Text is readable (minimum 16px)
- [ ] Images scale properly

### Navigation
- [ ] Home page navigation visible
- [ ] Menu/hamburger works on mobile
- [ ] Projects link accessible
- [ ] All links clickable
- [ ] No text overlap in header

### Forms
- [ ] Input fields easily tappable (44x44px minimum)
- [ ] Keyboard doesn't cover form
- [ ] Submit button accessible
- [ ] Placeholder text visible
- [ ] Error messages readable

### Buttons & Links
- [ ] All buttons have sufficient padding
- [ ] Links are tap-friendly
- [ ] Buttons have hover/active states
- [ ] No accidental double-clicking
- [ ] CTA buttons prominent

### Images
- [ ] Background images load
- [ ] Images not blurry
- [ ] Image carousel works
- [ ] No broken images
- [ ] Images responsive to screen size

### Typography
- [ ] Headings readable
- [ ] Body text not too small
- [ ] Line height sufficient
- [ ] No text clipping

### Spacing & Layout
- [ ] No overlapping elements
- [ ] Proper margins between sections
- [ ] Cards stack vertically on mobile
- [ ] Padding consistent
- [ ] Footer visible at bottom

### Footer
- [ ] Disclaimer visible
- [ ] Copyright year correct
- [ ] No text cutoff
- [ ] Links clickable

---

## Landscape Mode Testing

- [ ] [ ] Home page - landscape orientation
- [ ] [ ] Form page - landscape orientation
- [ ] [ ] Buttons accessible in landscape
- [ ] [ ] No content hidden
- [ ] [ ] Proper aspect ratio maintained

---

## Performance Tests

- [ ] Page loads quickly (< 3 seconds)
- [ ] Smooth scrolling
- [ ] Animations smooth
- [ ] No lag on interactions
- [ ] Form submission responsive

---

## Browser-Specific Tests

### Safari (iOS)
- [ ] Buttons have proper hit targets
- [ ] Keyboard behavior normal
- [ ] Status bar not covering content
- [ ] Pinch-to-zoom works
- [ ] Safe area respected (notch, home indicator)

### Chrome (Android)
- [ ] Back button works
- [ ] Navigation drawer (if used)
- [ ] Android keyboard behavior
- [ ] Status bar visibility
- [ ] No material design conflicts

---

## Accessibility Tests

- [ ] Can navigate with keyboard only
- [ ] Focus indicators visible
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Form labels associated with inputs
- [ ] Buttons have semantic meaning
- [ ] No text as images
- [ ] Alt text on images

---

## Common Mobile Issues Checklist

### Visual Issues
- [ ] No text overflow
- [ ] No image distortion
- [ ] Proper color rendering
- [ ] Button states clear
- [ ] Links distinguishable from text

### Functional Issues
- [ ] Forms submit correctly
- [ ] Links navigate properly
- [ ] Navigation works
- [ ] Buttons respond to tap
- [ ] Modals/popups display correctly

### Performance Issues
- [ ] First paint < 1.5s
- [ ] Largest contentful paint < 2.5s
- [ ] Cumulative layout shift minimal
- [ ] Interactive < 3.5s

### Connectivity Issues
- [ ] Works on 3G
- [ ] Handles slow network
- [ ] Loading states visible
- [ ] No incomplete renders

---

## Specific Page Checklists

### Home Page (`/`)
- [ ] Hero image loads
- [ ] Heading text readable
- [ ] Feature cards stack properly
- [ ] Buttons accessible
- [ ] Image carousel works
- [ ] Responsive layout maintained

### Form Page (`/form`)
- [ ] All steps visible
- [ ] Progress bar clear
- [ ] Step indicators responsive
- [ ] Form inputs accessible
- [ ] Dropdowns work on mobile
- [ ] Previous/Next buttons work
- [ ] Submit button prominent

### Results Page (`/results`)
- [ ] Lawyer cards display properly
- [ ] Contact buttons accessible
- [ ] Phone links work (tel:)
- [ ] Email links work (mailto:)
- [ ] Map integration (if present)
- [ ] Cards scrollable
- [ ] No content hidden

---

## Test Case Results

### Testing Date: ___________

#### iPhone SE (375px)
```
Overall: [ ] Pass [ ] Fail

Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

Notes:
_________________________________
```

#### iPhone 12 (390px)
```
Overall: [ ] Pass [ ] Fail

Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

Notes:
_________________________________
```

#### Pixel (412px)
```
Overall: [ ] Pass [ ] Fail

Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

Notes:
_________________________________
```

#### iPad (768px)
```
Overall: [ ] Pass [ ] Fail

Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

Notes:
_________________________________
```

---

## Issues Found

### Critical (Blocks Release)
- [ ] Issue 1: _______________
  - Device(s): _______________
  - Severity: HIGH
  - Fix: _______________

### High (Should Fix)
- [ ] Issue 1: _______________
  - Device(s): _______________
  - Severity: HIGH
  - Fix: _______________

### Medium (Nice to Have)
- [ ] Issue 1: _______________
  - Device(s): _______________
  - Severity: MEDIUM
  - Fix: _______________

### Low (Future Improvement)
- [ ] Issue 1: _______________
  - Device(s): _______________
  - Severity: LOW
  - Fix: _______________

---

## Sign-Off

- [ ] All critical tests passed
- [ ] All high priority tests passed
- [ ] Mobile experience acceptable
- [ ] Ready for production deployment

**Tested By:** ___________________  
**Date:** ___________________  
**Signature:** ___________________

---

## Quick Test Commands

**Using Chrome DevTools:**
```
1. Open DevTools (F12)
2. Toggle device mode (Ctrl+Shift+M)
3. Select device preset
4. Refresh page (F5)
5. Test all interactions
```

**Using Safari (macOS):**
```
1. Enable Developer Menu (Preferences > Advanced)
2. Develop > [Simulator Name] > Main Frame
3. Run website in iOS Simulator
4. Test touches and gestures
```

**Remote Testing:**
```
1. Get local IP: ipconfig getifaddr en0
2. Navigate to: http://[IP_ADDRESS]:3000
3. Test on physical device on same network
```

---

## Performance Benchmarks (Target)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| First Contentful Paint | < 1.5s | TBD | [ ] |
| Largest Contentful Paint | < 2.5s | TBD | [ ] |
| Time to Interactive | < 3.5s | TBD | [ ] |
| Cumulative Layout Shift | < 0.1 | TBD | [ ] |

---

## Final Notes

```
Important Reminders:
- Test on actual devices, not just browser DevTools
- Test in both portrait and landscape
- Test with various network speeds
- Test with different browsers
- Test accessibility features
- Document all issues found
- Prioritize critical issues
- Plan follow-up testing
```

---

**Testing Started:** ___________  
**Testing Completed:** ___________  
**Overall Result:** [ ] PASS [ ] FAIL  
**Recommendation:** [ ] Deploy [ ] Fix Issues [ ] Retest
