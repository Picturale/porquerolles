/**
 * Composant wrapper qui combine MentionInput et affichage des hashtags
 */
import { extractHashtags } from '../utils/hashtagUtils';
import MentionInput from './MentionInput';

const MentionHashtagWrapper = ({
  value = '',
  onChange,
  placeholder,
  multiline = false,
  maxLength = 500,
  showHashtagCount = true,
  className = '',
  onMentionSelect,
  disabled = false
}) => {
  const currentHashtags = extractHashtags(value);

  return (
    <div className="mention-hashtag-wrapper">
      <MentionInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline={multiline}
        maxLength={maxLength}
        className={className}
        onMentionSelect={onMentionSelect}
        disabled={disabled}
      />
      
      {showHashtagCount && currentHashtags.length > 0 && (
        <div className="hashtag-count-display">
          Hashtags: {currentHashtags.join(', ')} ({currentHashtags.length})
        </div>
      )}
      
      {maxLength && (
        <div className="character-count">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default MentionHashtagWrapper;
