/**
 * Split recipe instructions into sentences with smart handling of abbreviations
 * @param {string} text - The instruction text to split
 * @returns {string[]} Array of sentences
 */
export const splitIntoSentences = (text) => {
  if (!text) return [];

  // Step 1: Protect common cooking abbreviations and measurements
  const protectedText = text
    .replace(/(\d+\.?\d*)\s*(F|C)\./g, '$1°$2_TEMP')
    .replace(/(\d+\.?\d*)\s*(oz|lb|tbsp|tsp|cup|qt|gal)\./gi, '$1 $2_UNIT')
    .replace(/Tb\./g, 'Tb_MEASURE');

  // Step 2: Common cooking action verbs that start new steps
  const actionVerbs = [
    'Meanwhile',
    'Then',
    'When',
    'After',
    'Next',
    'Finally',
    'Remove',
    'Add',
    'Mix',
    'Stir',
    'Pour',
    'Bake',
    'Cook',
    'Heat',
    'Place',
    'Cover',
    'Serve',
    'Preheat',
    'Whisk',
    'Brush',
    'Drizzle',
    'Slice',
    'Chop',
    'Dice',
    'Mince',
    'Transfer',
    'Combine',
    'Reduce',
    'Increase',
    'Let',
    'Allow',
    'Set',
    'Refrigerate',
    'Freeze',
    'Blend',
    'Season',
    'Sprinkle',
    'Layer',
    'Flip',
    'Turn',
    'Fold',
  ].join('|');

  // Step 3: Split with lookahead/lookbehind
  const regex = new RegExp(`(?<=[.!?])\\s+(?=[A-Z]|${actionVerbs})`, 'g');

  const sentences = protectedText.split(regex);

  // Step 4: Restore protected terms and clean
  return sentences
    .map((s) =>
      s
        .replace(/_TEMP/g, '.')
        .replace(/_UNIT/g, '.')
        .replace(/_MEASURE/g, '.')
        .trim()
    )
    .filter((s) => s.length > 15) // Ignore very short fragments
    .map((s) => {
      // Ensure proper capitalization
      return s.charAt(0).toUpperCase() + s.slice(1);
    });
};

/**
 * Parse HTML or plain text instructions into structured steps
 * @param {string} text - Instruction text (HTML or plain)
 * @returns {Array<{type: string, number?: number, text: string}>}
 */
export const parseInstructions = (text) => {
  if (!text) return [];

  // Check if it's HTML (contains <li> or <ol> tags)
  const isHTML = /<li>|<ol>/i.test(text);

  if (isHTML) {
    // Parse HTML list
    const items = text
      .split(/<\/?li>/gi)
      .map((step) => step.replace(/<[^>]*>/g, '').trim())
      .filter((step) => step.length > 0);

    let stepCounter = 0;
    return items.map((item) => {
      const isHeader =
        (/^To prepare|^For the/i.test(item) && item.endsWith(':')) ||
        (/^To prepare|^For the/i.test(item) &&
          item.length < 50 &&
          !item.includes('.'));

      if (isHeader) {
        return { type: 'header', text: item.replace(':', '') };
      } else {
        stepCounter++;
        return { type: 'step', number: stepCounter, text: item };
      }
    });
  } else {
    // Parse plain text - try different splitting strategies

    // Strategy 1: Check if text has numbered steps (1., 2., etc.)
    const numberedPattern = /^\d+\.\s+/m;
    if (numberedPattern.test(text)) {
      const steps = text
        .split(/(?=\d+\.\s+)/) // Split before numbers
        .map((step) => step.replace(/^\d+\.\s+/, '').trim()) // Remove numbers
        .filter((step) => step.length > 0);

      return steps.map((step, index) => ({
        type: 'step',
        number: index + 1,
        text: step,
      }));
    }

    // Strategy 2: Split by double newlines (paragraphs)
    const paragraphs = text
      .split(/\n\n+/)
      .map((para) => para.replace(/\n/g, ' ').trim())
      .filter((para) => para.length > 0);

    if (paragraphs.length > 1) {
      return paragraphs.map((para, index) => ({
        type: 'step',
        number: index + 1,
        text: para,
      }));
    }

    // Strategy 3: Split by single newlines (last resort)
    const lines = text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.map((line, index) => ({
      type: 'step',
      number: index + 1,
      text: line,
    }));
  }
};

/**
 * Strip HTML tags from text
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};
