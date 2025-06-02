"use client";

import Image from "next/image";
import { SearchResult } from "@/types/search";
import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api-client";

const Movie = ({ result }: { result: SearchResult }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [patentData, setPatentData] = useState<any>(null);
  const [patentImages, setPatentImages] = useState<string[]>([]);

  // Function to extract image URLs from ai_summary
  const extractImageUrls = (summary: string): { urls: string[], cleanedSummary: string } => {
    // Using a more compatible approach without the 's' flag
    const imageUrlsRegex = /<image_urls>([\s\S]*?)<\/image_urls>/;
    const match = summary.match(imageUrlsRegex);
    
    let urls: string[] = [];
    let cleanedSummary = summary;
    
    if (match && match[1]) {
      // Extract URLs from the matched content
      const urlContent = match[1].trim();
      if (urlContent) {
        // Split by commas first, then trim each URL
        urls = urlContent.split(',').map(url => url.trim()).filter(url => url);
      }
      
      // Remove the image_urls tag and its content from the summary
      cleanedSummary = summary.replace(imageUrlsRegex, '');
    }
    
    return { urls, cleanedSummary };
  };

  // Function to fetch patent data if needed
  const fetchPatentData = async () => {
    if (!result.ai_summary && result.query) {
      try {
        const data = await apiClient.search({
          query: result.query
        });
        
        // Find the matching patent data based on the result
        const matchingPatent = data.results.find((patent: any) => 
          patent.sys_id === result.sys_id || 
          patent.official_title === result.title
        ) || data.results[0]; // Use the first result if no match found
        
        if (matchingPatent) {
          return matchingPatent;
        }
      } catch (error) {
        console.error("Error fetching patent data:", error);
      }
    }
    return null;
  };

  const processPatentData = async () => {
    setIsLoading(true);
    
    try {
      // If we already have ai_summary, use it directly
      if (result.ai_summary) {
        const { urls, cleanedSummary } = extractImageUrls(result.ai_summary);
        setPatentImages(urls.length > 0 ? urls : []);
        
        setPatentData({
          ...result,
          ai_summary: cleanedSummary
        });
      } else {
        // Otherwise, try to fetch it
        const fetchedData = await fetchPatentData();
        
        if (fetchedData && fetchedData.ai_summary) {
          const { urls, cleanedSummary } = extractImageUrls(fetchedData.ai_summary);
          setPatentImages(urls.length > 0 ? urls : []);
          
          setPatentData({
            ...fetchedData,
            ai_summary: cleanedSummary
          });
        } else {
          // If we still don't have ai_summary, just use what we have
          setPatentData(result);
        }
      }
    } catch (error) {
      console.error("Error processing patent data:", error);
      setPatentData(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewClick = () => {
    if (result.is_tech && result.google_patent_link) {
      window.open(result.google_patent_link, '_blank');
    } else {
      setIsLoading(true);
      processPatentData();
      setShowPopup(true);
    }
  };

  // Function to render markdown links as actual HTML links
  const renderLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(linkRegex, '<a href="$2" target="_blank" class="text-[#a02337] hover:underline">$1</a>');
  };

  // Function to parse and format the content
  const formatContent = (text: string) => {
    if (!text) return '';
    
    // console.log('formatContent input text:', text);
    
    const sections = text.split('\n\n');
    // console.log('Split sections:', sections);
    
    const formattedSections = sections.map((section, index) => {
      if (section.startsWith('####')) {
        // Special handling for Reference Links section
        if (section.includes('Reference Links:')) {
          // console.log('Found Reference Links section:', section);
          
          // First try to get links from the current section
          let lines = section.split('\n');
          let header = lines[0].replace('####', '').trim();
          let links = lines.slice(1).filter(line => line.trim());
          
          // If no links in current section, try next section
          if (links.length === 0 && index + 1 < sections.length) {
            // console.log('No links in current section, checking next section');
            const nextSection = sections[index + 1];
            if (nextSection && !nextSection.startsWith('#')) {
              links = nextSection.split('\n').filter(line => line.trim());
              // Mark next section as processed
              sections[index + 1] = '';
            }
          }
          
          // console.log('Reference Links header:', header);
          // console.log('Existing links:', links);
          
          // If this is a China patent and not a tech, add CNIPA link
          if (!patentData?.is_tech && patentData?.is_cn_applied) {
            // console.log('Patent is China and not tech:', { is_tech: patentData?.is_tech, country_region: patentData?.country_region });
            
            const nextNumber = links.length + 1;
            const cnipaLink = `${nextNumber}. [CNIPA Search](https://pss-system.cponline.cnipa.gov.cn/conventionalSearch)`;
            // console.log('Adding CNIPA link:', cnipaLink);
            
            links.push(cnipaLink);
            // console.log('Updated links with CNIPA:', links);
          }
          
          const formattedSection = `<h4 class="text-lg font-semibold mt-4 mb-2">${header}</h4><p class="my-2">${links.join('\n')}</p>`;
          // console.log('Formatted Reference Links section:', formattedSection);
          
          return formattedSection;
        }
        return `<h4 class="text-lg font-semibold mt-4 mb-2">${section.replace('####', '')}</h4>`;
      } else if (section.startsWith('###')) {
        return `<h3 class="text-xl font-semibold mt-4 mb-2">${section.replace('###', '')}</h3>`;
      } else if (section.startsWith('##')) {
        return `<h2 class="text-2xl font-bold mt-6 mb-3">${section.replace('##', '')}</h2>`;
      } else if (section.startsWith('#')) {
        return `<h1 class="text-3xl font-bold mt-6 mb-4">${section.replace('#', '')}</h1>`;
      } else if (section.includes('- ')) {
        return `<ul class="list-disc pl-5 my-2">${section.split('\n').map(item => `<li>${item.replace('- ', '')}</li>`).join('')}</ul>`;
      } else if (section.trim()) {  // Only process non-empty sections
        return `<p class="my-2">${section}</p>`;
      }
      return '';  // Return empty string for empty sections
    });

    const joinedSections = formattedSections.join('');
    // console.log('Joined formatted sections:', joinedSections);
    
    const finalResult = renderLinks(joinedSections);
    // console.log('Final result after renderLinks:', finalResult);
    
    return finalResult;
  };

  return (
    <div className="relative overflow-hidden rounded-md shadow-md bg-white border border-gray-200 p-4">
      <div className="flex flex-col justify-between w-full h-full">
        <div>
          {/* Title and Relevance Score */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-[#a02337] flex-1 pr-4">
              {result.official_title || result.title || 'No Title'}
            </h2>
            
            {/* Relevance Score */}
            {result.similarity !== undefined && (
              <div className="flex-shrink-0">
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.91549430918954"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.91549430918954"
                      fill="none"
                      stroke="#a02337"
                      strokeWidth="3"
                      strokeDasharray={`${result.similarity * 100} ${100 - result.similarity * 100}`}
                      strokeDashoffset="25"
                      transform="rotate(-90 18 18)"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {(result.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              result.is_tech 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {result.is_tech ? 'Technology' : 'Patent'}
            </span>
          </div>

          {/* Basic Info */}
          <div className="mb-4 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Inventor:</span> {result.inventor || 'Unknown'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Department:</span> {result.departments && result.departments.length > 0 ? result.departments.map(d => d.abbreviation).join(', ') : 'N/A'}
            </p>
          </div>

          {/* Short Summary */}
          {result.ai_short_summary && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {result.ai_short_summary}
              </p>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleViewClick}
          className="search-button inline-block px-3 py-2 text-sm rounded-md w-fit"
        >
          View
        </button>
      </div>

      {/* Popup overlay */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-[95%] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-[#a02337]">{patentData?.official_title || result.official_title || result.title || 'Patent Summary'}</h3>
              <button 
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-[#a02337] text-xl"
              >
                ✕
              </button>
            </div>
            
            {/* Patent Images Gallery */}
            {!isLoading && patentImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-[#a02337]">Patent Figures</h4>
                <div className="relative">
                  <div className="relative h-[400px] w-full bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <img
                      src={patentImages[activeImageIndex]} 
                      alt={`Patent figure ${activeImageIndex + 1}`}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  
                  {/* Navigation arrows */}
                  {patentImages.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImageIndex(prev => (prev === 0 ? patentImages.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#a02337] bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
                        aria-label="Previous image"
                      >
                        ←
                      </button>
                      <button 
                        onClick={() => setActiveImageIndex(prev => (prev === patentImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#a02337] bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
                        aria-label="Next image"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>
                
                {/* Thumbnails */}
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {patentImages.map((img, index) => (
                    <button 
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 ${activeImageIndex === index ? 'border-[#a02337]' : 'border-transparent'}`}
                    >
                      <img
                        src={img} 
                        alt={`Thumbnail ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">Figure {activeImageIndex + 1} of {patentImages.length}</p>
              </div>
            )}
            
            {/* Patent Details */}
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a02337]"></div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-[#a02337]">Patent Information</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="mb-2"><span className="font-medium">Inventor:</span> {patentData?.inventor || 'N/A'}</p>
                      <p className="mb-2"><span className="font-medium">Department:</span> {patentData?.departments && patentData.departments.length > 0 ? patentData.departments.map((d: any) => d.abbreviation).join(', ') : 'N/A'}</p>
                      {patentData?.google_patent_link && (
                        <p className="mb-2">
                          <span className="font-medium">Google Patent:</span>{' '}
                          <a 
                            href={patentData.google_patent_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#a02337] hover:underline"
                          >
                            View on Google Patents
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* AI Summary */}
                {!isLoading && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-[#a02337]">Patent Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div 
                        className="prose prose-[#a02337] max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatContent(patentData.ai_summary) }}
                      />
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          Disclaimer:
                          The bilingual translation summary provided here is generated by AI and is intended for reference only. Please note that any information related to patents should be verified by referring to the official documents published on recognized patent sites. The University does not guarantee the completeness or accuracy of the AI-generated summaries or translations and assumes no liability for any discrepancies.
                          <br /><br />
                          免責聲明:
                          這裡提供的雙語摘要及翻譯由人工智能產生，僅供參考。請注意，任何與專利相關的資訊應通過查閱公認專利網站上發布的官方文件進行核實。大學不保證人工智能提供的摘要及翻譯的完整性或準確性，並不會對任何差異承擔責任。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Movie;
