import type { IconStyle } from "./types";

/**
 * Parse the inner contents of an <svg>...</svg> string,
 * stripping the wrapping <svg> tag and returning the body.
 */
export function getSvgInner(svg: string): string {
  const m = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/);
  return m ? m[1] : svg;
}

/**
 * Return a standalone SVG with the given size and color baked in
 * (used for downloads and for the "Copy SVG" output).
 */
export function buildStandaloneSvg(
  body: string,
  opts: { size: number; color: string }
): string {
  const inner = getSvgInner(body);
  const colorized = inner.replace(/currentColor/g, opts.color);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.size}" height="${opts.size}" viewBox="0 0 24 24">${colorized}</svg>`;
}

/**
 * Convert an icon SVG into a React JSX component string.
 */
export function buildJsx(
  body: string,
  opts: { pascalName: string; style: IconStyle }
): string {
  const inner = getSvgInner(body)
    // Convert attribute names that differ in JSX
    .replace(/\sstroke-width="/g, " strokeWidth=\"")
    .replace(/\sstroke-linecap="/g, " strokeLinecap=\"")
    .replace(/\sstroke-linejoin="/g, " strokeLinejoin=\"")
    .replace(/\sstroke-miterlimit="/g, " strokeMiterlimit=\"")
    .replace(/\sfill-rule="/g, " fillRule=\"")
    .replace(/\sclip-rule="/g, " clipRule=\"")
    .replace(/\sfill-opacity="/g, " fillOpacity=\"")
    .replace(/\sstroke-opacity="/g, " strokeOpacity=\"")
    .replace(/\sxlink:href="/g, " xlinkHref=\"")
    // remove id attrs to keep JSX tidy and avoid duplicate DOM ids
    .replace(/\sid="[^"]*"/g, "");

  const componentName = `${opts.pascalName}${opts.style}`;
  return `import * as React from "react";

export const ${componentName} = ({
  size = 24,
  color = "currentColor",
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number | string; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    color={color}
    {...props}
  >${inner}</svg>
);

export default ${componentName};
`;
}

/**
 * CSS background-image: url("data:image/svg+xml;..."), inlined.
 */
export function buildCss(
  body: string,
  opts: { size: number; color: string; className: string }
): string {
  const svg = buildStandaloneSvg(body, opts);
  // URL-encode without bloating it
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `.${opts.className} {
  width: ${opts.size}px;
  height: ${opts.size}px;
  display: inline-block;
  background-color: transparent;
  background-image: url("data:image/svg+xml;charset=utf-8,${encoded}");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}`;
}

