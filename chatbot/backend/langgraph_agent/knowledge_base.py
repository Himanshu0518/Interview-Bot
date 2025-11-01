import os
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import time
import re

load_dotenv()

class WebsiteKnowledgeBase:
    """Scrapes website content and creates a vector database for RAG"""
    
    def __init__(self):
        self.base_url = os.getenv("WEBSITE_BASE_URL", "http://localhost:5173")
        self.embedding_model = SentenceTransformer(os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"))
        
        # Initialize ChromaDB
        self.chroma_client = chromadb.Client(Settings(
            persist_directory="./chroma_db",
            anonymized_telemetry=False
        ))
        
        # Get or create collection
        try:
            self.collection = self.chroma_client.get_collection("website_content")
        except:
            self.collection = self.chroma_client.create_collection(
                name="website_content",
                metadata={"description": "Interview Bot website content"}
            )
    
    def scrape_page(self, url: str) -> Optional[Dict[str, str]]:
        """Scrape content from a single page"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, timeout=10, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Get text content
            text = soup.get_text(separator=' ', strip=True)
            
            # Clean up text
            text = ' '.join(text.split())  # Remove extra whitespace
            
            # Get page title
            title = soup.title.string if soup.title else url
            
            return {
                "url": url,
                "title": title,
                "content": text,
                "html": str(soup)
            }
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None
    
    def extract_current_question(self, page_path: str = None) -> Optional[Dict[str, str]]:
        """Extract the current question and options from test/mock page"""
        try:
            if not page_path:
                # Try both test and mock pages
                for path in ["/test", "/mock"]:
                    result = self._extract_from_path(path)
                    if result:
                        return result
                return None
            else:
                return self._extract_from_path(page_path)
        except Exception as e:
            print(f"Error extracting question: {e}")
            return None
    
    def _extract_from_path(self, path: str) -> Optional[Dict[str, str]]:
        """Extract question from specific path"""
        url = f"{self.base_url}{path}"
        page_data = self.scrape_page(url)
        
        if not page_data:
            return None
        
        soup = BeautifulSoup(page_data['html'], 'html.parser')
        content = page_data['content']
        
        # Extract question text - look for common patterns
        question_text = None
        options = []
        
        # Pattern 1: Look for elements with "question" in class or id
        question_elements = soup.find_all(['div', 'p', 'h1', 'h2', 'h3'], 
                                         class_=re.compile(r'question', re.I))
        if not question_elements:
            question_elements = soup.find_all(['div', 'p', 'h1', 'h2', 'h3'], 
                                             id=re.compile(r'question', re.I))
        
        if question_elements:
            question_text = question_elements[0].get_text(strip=True)
        
        # Pattern 2: Look for question number patterns like "Q1:", "Question 1:", etc.
        if not question_text:
            question_match = re.search(r'(?:Q(?:uestion)?\s*\d+[:.]\s*)(.+?)(?=(?:A\)|Option|$))', 
                                      content, re.IGNORECASE | re.DOTALL)
            if question_match:
                question_text = question_match.group(1).strip()
        
        # Pattern 3: Look for options (A), (B), (C), (D) or A), B), C), D)
        option_patterns = [
            r'([A-D][\).])\s*(.+?)(?=[A-D][\).]|$)',
            r'\(([A-D])\)\s*(.+?)(?=\([A-D]\)|$)',
            r'Option\s+([A-D])[:.]\s*(.+?)(?=Option\s+[A-D]|$)'
        ]
        
        for pattern in option_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                option_label = match.group(1)
                option_text = match.group(2).strip()
                if option_text and len(option_text) < 500:  # Reasonable option length
                    options.append(f"{option_label} {option_text}")
        
        # Pattern 4: Look for elements with "option" in class
        if not options:
            option_elements = soup.find_all(['div', 'li', 'button'], 
                                           class_=re.compile(r'option', re.I))
            for elem in option_elements[:4]:  # Usually 4 options
                text = elem.get_text(strip=True)
                if text and len(text) < 200:
                    options.append(text)
        
        if question_text:
            return {
                "question": question_text,
                "options": options if options else [],
                "full_context": content[:2000],  # First 2000 chars
                "page_type": "MCQ" if "test" in path else "Mock"
            }
        
        return None
    
    def get_live_page_context(self, page_path: str = None) -> Optional[str]:
        """Get current live content from a specific page"""
        try:
            # First, try to extract structured question
            question_data = self.extract_current_question(page_path)
            
            if question_data:
                context = f"Current Question: {question_data['question']}\n"
                if question_data['options']:
                    context += "\nOptions:\n" + "\n".join(question_data['options'])
                return context
            
            # Fallback to general page content
            if not page_path:
                test_url = f"{self.base_url}/test"
                page_data = self.scrape_page(test_url)
                if not page_data:
                    mock_url = f"{self.base_url}/mock"
                    page_data = self.scrape_page(mock_url)
            else:
                url = f"{self.base_url}{page_path}"
                page_data = self.scrape_page(url)
            
            if page_data:
                return page_data["content"][:1000]  # First 1000 chars
            return None
        except Exception as e:
            print(f"Error getting live page context: {e}")
            return None
    
    def index_website(self):
        """Index all pages of the website"""
        
        # Define pages to scrape (adjust based on your routes)
        pages = [
            "/",
            "/home",
            "/about",
            "/login",
            "/signup",
            "/upload_resume",
            "/test_setup",
            "/mock_setup",
            "/test",
            "/mock"
        ]
        
        documents = []
        metadatas = []
        ids = []
        
        print("🔄 Starting website indexing...")
        
        for i, page in enumerate(pages):
            url = f"{self.base_url}{page}"
            print(f"📄 Scraping: {url}")
            
            page_data = self.scrape_page(url)
            if page_data and page_data["content"]:
                # Split content into chunks (for better retrieval)
                chunks = self._chunk_text(page_data["content"], chunk_size=500)
                
                for j, chunk in enumerate(chunks):
                    if chunk.strip():  # Only add non-empty chunks
                        documents.append(chunk)
                        metadatas.append({
                            "url": page_data["url"],
                            "title": page_data["title"],
                            "page": page,
                            "chunk_id": j
                        })
                        ids.append(f"doc_{i}_{j}")
            
            time.sleep(0.5)  # Be nice to the server
        
        # Create embeddings and add to ChromaDB
        if documents:
            print(f"💾 Indexing {len(documents)} document chunks...")
            
            # Clear existing collection
            try:
                self.chroma_client.delete_collection("website_content")
                self.collection = self.chroma_client.create_collection(
                    name="website_content",
                    metadata={"description": "Interview Bot website content"}
                )
            except:
                pass
            
            embeddings = self.embedding_model.encode(documents).tolist()
            
            self.collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            print("✅ Website indexing complete!")
            print(f"📊 Indexed {len(documents)} chunks from {len(pages)} pages")
        else:
            print("❌ No documents to index")
    
    def _chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split text into smaller chunks"""
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0
        
        for word in words:
            current_chunk.append(word)
            current_size += len(word) + 1
            
            if current_size >= chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_size = 0
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def search(self, query: str, n_results: int = 3) -> List[Dict]:
        """Search the knowledge base"""
        try:
            # Create query embedding
            query_embedding = self.embedding_model.encode([query]).tolist()
            
            # Search ChromaDB
            results = self.collection.query(
                query_embeddings=query_embedding,
                n_results=n_results
            )
            
            # Format results
            formatted_results = []
            if results and results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        "content": doc,
                        "metadata": results['metadatas'][0][i],
                        "distance": results['distances'][0][i] if results.get('distances') else 0
                    })
            
            return formatted_results
        except Exception as e:
            print(f"Search error: {e}")
            return []

# Utility function to manually index the website
if __name__ == "__main__":
    print("🚀 Starting Website Knowledge Base Indexing...")
    print("⚠️  Make sure your frontend is running on http://localhost:5173")
    print()
    
    kb = WebsiteKnowledgeBase()
    kb.index_website()
    
    print()
    print("🧪 Testing search functionality...")
    results = kb.search("how to upload resume", n_results=2)
    if results:
        print(f"✅ Search working! Found {len(results)} results")
        print(f"📄 Sample result: {results[0]['content'][:100]}...")
    else:
        print("⚠️  Search returned no results")
    
    print()
    print("🧪 Testing question extraction...")
    question = kb.extract_current_question("/test")
    if question:
        print(f"✅ Question extraction working!")
        print(f"📝 Question: {question['question'][:100]}...")
        if question['options']:
            print(f"📋 Options found: {len(question['options'])}")
    else:
        print("⚠️  Could not extract question (page might not have active question)")
