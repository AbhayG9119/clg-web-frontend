# TODO: Improve Lighthouse Performance for Home Page

## Current Performance Analysis

- Home page includes scrolling text animation, hero image, multiple cards with lists, and lazy-loaded images
- Potential issues: Large hero image (1140x580), CSS animations, bundle size, render-blocking resources
- Lighthouse metrics to target: FCP, LCP, CLS, TBT, Speed Index

## Tasks

### 1. Image Optimization

- [ ] Add responsive images with srcSet for hero image to serve appropriate sizes
- [ ] Convert images to WebP format with fallbacks
- [ ] Preload critical hero image in document head
- [ ] Optimize image compression (external task)

### 2. CSS and Animation Optimization

- [x] Add `will-change` property to animated elements for GPU acceleration
- [x] Optimize animation performance by using transform instead of changing top/left
- [ ] Minimize unused CSS rules in home.css
- [ ] Inline critical CSS above the fold

### 3. Bundle and Loading Optimization

- [x] Implement code splitting for route components in App.js
- [ ] Lazy load non-critical components
- [ ] Defer non-critical JavaScript
- [ ] Add resource hints (preconnect, dns-prefetch) for external resources

### 4. React Performance

- [x] Memoize Home component to prevent unnecessary re-renders
- [x] Optimize LazyImage component with React.memo
- [ ] Reduce DOM size by simplifying card structures if possible

### 5. Accessibility and Best Practices

- [ ] Ensure proper alt texts for all images
- [ ] Add ARIA labels where needed
- [ ] Verify color contrast ratios

### 6. Testing and Validation

- [ ] Run Lighthouse tests before and after changes
- [ ] Test on different devices and network conditions
- [ ] Verify no regression in functionality
