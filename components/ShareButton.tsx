// Componente de Compartilhamento Social
import React, { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title?: string;
  description?: string;
  type?: 'post' | 'service' | 'profile' | 'group';
  itemId?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description,
  type = 'post',
  itemId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const shareText = title || description || 'Confira isso no MIGGRO!';
  const shareUrl = encodeURIComponent(fullUrl);
  const shareTitle = encodeURIComponent(shareText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (platform: string) => {
    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${shareTitle}%20${shareUrl}`;
        break;
      default:
        return;
    }

    window.open(shareLink, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: description,
          url: fullUrl,
        });
        setIsOpen(false);
      } catch (err) {
        // Usuário cancelou ou erro
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 hover:text-miggro-teal transition-colors"
        aria-label="Compartilhar"
      >
        <Share2 size={18} />
        <span className="text-sm">Compartilhar</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
              >
                <Share2 size={18} className="text-gray-600" />
                <span>Compartilhar via...</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-green-600" />
                  <span className="text-green-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={18} className="text-gray-600" />
                  <span>Copiar link</span>
                </>
              )}
            </button>

            <div className="border-t border-gray-200 my-1" />

            <button
              onClick={() => handleShare('facebook')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <Facebook size={18} className="text-blue-600" />
              <span>Facebook</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <Twitter size={18} className="text-blue-400" />
              <span>Twitter</span>
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <Linkedin size={18} className="text-blue-700" />
              <span>LinkedIn</span>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <MessageCircle size={18} className="text-green-600" />
              <span>WhatsApp</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
<<<<<<< HEAD
=======
=======
// Componente de Compartilhamento Social
import React, { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title?: string;
  description?: string;
  type?: 'post' | 'service' | 'profile' | 'group';
  itemId?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description,
  type = 'post',
  itemId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const shareText = title || description || 'Confira isso no MIGGRO!';
  const shareUrl = encodeURIComponent(fullUrl);
  const shareTitle = encodeURIComponent(shareText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (platform: string) => {
    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${shareTitle}%20${shareUrl}`;
        break;
      default:
        return;
    }

    window.open(shareLink, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: description,
          url: fullUrl,
        });
        setIsOpen(false);
      } catch (err) {
        // Usuário cancelou ou erro
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 hover:text-miggro-teal transition-colors"
        aria-label="Compartilhar"
      >
        <Share2 size={18} />
        <span className="text-sm">Compartilhar</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
              >
                <Share2 size={18} className="text-gray-600" />
                <span>Compartilhar via...</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-green-600" />
                  <span className="text-green-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={18} className="text-gray-600" />
                  <span>Copiar link</span>
                </>
              )}
            </button>

            <div className="border-t border-gray-200 my-1" />

            <button
              onClick={() => handleShare('facebook')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <Facebook size={18} className="text-blue-600" />
              <span>Facebook</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <Twitter size={18} className="text-blue-400" />
              <span>Twitter</span>
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <Linkedin size={18} className="text-blue-700" />
              <span>LinkedIn</span>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <MessageCircle size={18} className="text-green-600" />
              <span>WhatsApp</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
>>>>>>> origin/main
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
