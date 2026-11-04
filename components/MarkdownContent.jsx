function renderInline(text) {
  const tokens = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  return text.split(tokens).map((part, index) => {
    if (!part) return null;
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) {
      return (
        <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

function isBlockStart(line) {
  return /^(#{1,3}\s|>\s?|[-*]\s+|\d+\.\s+|---+$)/.test(line);
}

export default function MarkdownContent({ content }) {
  const lines = content.split(/\r?\n/);
  const blocks = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = `h${heading[1].length + 1}`;
      blocks.push(<Tag key={index}>{renderInline(heading[2])}</Tag>);
      index += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={index} />);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(<blockquote key={index}>{renderInline(quote.join(" "))}</blockquote>);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      const items = [];
      const pattern = unordered ? /^[-*]\s+(.+)$/ : /^\d+\.\s+(.+)$/;
      while (index < lines.length) {
        const item = lines[index].match(pattern);
        if (!item) break;
        items.push(<li key={index}>{renderInline(item[1])}</li>);
        index += 1;
      }
      const List = unordered ? "ul" : "ol";
      blocks.push(<List key={index}>{items}</List>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p key={index}>
        {paragraph.map((part, partIndex) => (
          <span key={partIndex}>
            {partIndex > 0 && <br />}
            {renderInline(part)}
          </span>
        ))}
      </p>
    );
  }

  return <div className="prose prose-neutral max-w-none dark:prose-invert">{blocks}</div>;
}
