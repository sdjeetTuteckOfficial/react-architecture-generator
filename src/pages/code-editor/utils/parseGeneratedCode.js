export const parseGeneratedCode = (markdownText) => {
  const files = [];
  const fileRegex = /^(?:\/\/|#)\s*([^\n]+)\n([\s\S]*?)(?=(?:^\/\/|^#|\Z))/gm;
  let match;

  while ((match = fileRegex.exec(markdownText)) !== null) {
    const fullPath = match[1].trim();
    if (fullPath.match(/^\w+\s+\w+/)) continue;
    let content = match[2].trim();
    if (!content) continue;

    content = content.replace(
      /```(?:javascript|python|json|sql|markdown|typescript|html|css)?\n|\n```/g,
      ''
    );

    const pathParts = fullPath.split('/');
    const fileName = pathParts.pop();
    const fileExtension = fileName.split('.').pop();

    let language = 'plaintext';
    if (fileExtension === 'js' || fileExtension === 'jsx')
      language = 'javascript';
    else if (fileExtension === 'py') language = 'python';
    else if (fileExtension === 'json') language = 'json';
    else if (fileExtension === 'sql') language = 'sql';
    else if (fileExtension === 'md') language = 'markdown';
    else if (fileExtension === 'html') language = 'html';
    else if (fileExtension === 'css') language = 'css';
    else if (fileExtension === 'ts' || fileExtension === 'tsx')
      language = 'typescript';
    else if (fileExtension === 'xml') language = 'xml';
    else if (fileExtension === 'yml' || fileExtension === 'yaml')
      language = 'yaml';
    else if (fileExtension === 'env') language = 'ini';

    files.push({
      id: fullPath,
      path: fullPath,
      name: fileName,
      content: content,
      language: language,
    });
  }

  return files;
};
