/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { 
  ClipboardCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Upload,
  FileUp,
  FileSearch,
  LogOut,
  LogIn,
  UserPlus,
  History,
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  Circle,
  Target,
  MessageSquare,
  MessageCircle,
  Send,
  X,
  Minimize2,
  Bot,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HeroGeometric, ElegantShape } from "./components/ui/shape-landing-hero";
import { cn } from "./lib/utils";
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  handleFirestoreError,
  OperationType
} from "./firebase";

// Types for the evaluation result
interface RubricScore {
  marks_awarded: number;
  max_marks: number;
  reason: string;
}

interface EvaluationResult {
  rubric_scores: Record<string, RubricScore>;
  missing_concepts: string[];
  detected_concepts: string[];
  total_score: number;
  feedback: string;
  semantic_similarity_score: number;
}

interface EvaluationRecord {
  id: string;
  question: string;
  totalMarks: number;
  result: EvaluationResult;
  createdAt: string;
}

// Auth Context
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>({ user: null, loading: true });

const useAuth = () => useContext(AuthContext);

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030303] text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
      </div>

      <div className="relative z-10">
        {children}
      </div>

      <div className="fixed inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303]">
        <Loader2 className="animate-spin text-indigo-400" size={48} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <PageLayout>
        <AnimatePresence mode="wait">
          {!user ? (
            !showAuth ? (
              <LandingPage key="landing" onGetStarted={() => setShowAuth(true)} />
            ) : (
              <FacultyAuth key="auth" onBack={() => setShowAuth(false)} />
            )
          ) : (
            <MainApp key="app" />
          )}
        </AnimatePresence>
      </PageLayout>
    </AuthContext.Provider>
  );
}

function LandingPage({ onGetStarted }: { onGetStarted: () => void; key?: string }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
        >
          <Circle className="h-2 w-2 fill-rose-500/80" />
          <span className="text-sm text-white/60 tracking-wide">ExamEval AI</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 tracking-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
            Precision Grading
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
            Powered by Intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="text-base sm:text-lg md:text-xl text-white/40 mb-12 leading-relaxed font-light tracking-wide max-w-xl mx-auto"
        >
          Crafting exceptional digital experiences through innovative design and cutting-edge technology.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          onClick={onGetStarted}
          className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-2xl hover:bg-slate-100 transition-all flex items-center gap-2 group mx-auto"
        >
          Get Started
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
}

function FacultyAuth({ onBack }: { onBack: () => void; key?: string }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "faculty_profiles", userCred.user.uid), {
          uid: userCred.user.uid,
          email: userCred.user.email,
          role: "faculty",
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const docRef = doc(db, "faculty_profiles", userCred.user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: userCred.user.uid,
          email: userCred.user.email,
          displayName: userCred.user.displayName,
          role: "faculty",
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/[0.08] overflow-hidden">
        <div className="bg-indigo-500/10 p-8 text-white text-center relative border-b border-white/[0.08]">
          <button 
            onClick={onBack}
            className="absolute left-4 top-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/[0.08]"
          >
            <ArrowRight className="rotate-180" size={16} />
          </button>
          <div className="inline-flex p-3 bg-white/5 rounded-2xl mb-4 backdrop-blur-sm border border-white/[0.08]">
            <GraduationCap size={40} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">ExamEval AI</h1>
          <p className="text-white/40 mt-2 text-sm">Faculty Portal Access</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm text-white placeholder:text-white/10"
                  placeholder="faculty@university.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm text-white placeholder:text-white/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black hover:bg-slate-100 disabled:bg-white/10 disabled:text-white/20 rounded-xl font-bold shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? "Create Account" : "Sign In")}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#030303] px-2 text-white/20 font-medium tracking-widest">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mt-6 w-full py-3 bg-white/5 border border-white/[0.08] hover:bg-white/10 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-80" />
            Sign in with Google
          </button>

          <p className="mt-8 text-center text-sm text-white/40">
            {isSignUp ? "Already have an account?" : "New to ExamEval?"}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white font-bold hover:underline"
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "Hello! I'm your Rubric Assistant. How can I help you with grading or rubric creation today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            systemInstruction: "You are an expert academic assistant specializing in rubrics, grading criteria, and educational assessment. Help users create rubrics, explain grading standards, and provide advice on objective evaluation. Keep responses concise and professional.",
          },
        });
      }

      const response = await chatRef.current.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: "model", text: response.text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 md:w-96 h-[500px] bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Bot size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white/90">Rubric Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
              >
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === "user" ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white/5 border border-white/10 text-white/80 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 size={16} className="animate-spin text-indigo-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about rubrics..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
          isOpen 
            ? "bg-white/10 border border-white/20 text-white rotate-90" 
            : "bg-indigo-600 text-white hover:bg-indigo-500"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}

function MainApp({}: { key?: string }) {
  const { user } = useAuth();
  const [gradingMode, setGradingMode] = useState<'withModel' | 'assignmentGrading'>('withModel');
  const [question, setQuestion] = useState("");
  const [totalMarks, setTotalMarks] = useState("10");
  const [rubric, setRubric] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EvaluationRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const modelFileRef = useRef<HTMLInputElement>(null);
  const studentFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "evaluations"),
      where("facultyId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EvaluationRecord[];
      setHistory(records);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "evaluations");
    });
    return () => unsubscribe();
  }, [user]);

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleFileUpload = async (file: File, target: 'model' | 'student') => {
    if (!file) return;

    setIsLoading(true);
    setLoadingStage(`Extracting text from ${file.name}...`);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        const text = await file.text();
        if (target === 'model') setModelAnswer(text);
        else setStudentAnswer(text);
      } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const imagePart = await fileToGenerativePart(file);
        
        // Step 1: Layout Awareness & OCR
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{
            role: "user",
            parts: [
              imagePart,
              { text: `You are a document understanding system. Analyze this exam answer sheet image.
Tasks:
1. Identify the region containing the written answer.
2. Ignore headers, margins, page numbers, and student IDs.
3. Extract the text content from the identified answer region accurately.

Return JSON:
{
 "answer_region": [x1, y1, x2, y2],
 "raw_text": "extracted text here"
}` }
            ]
          }],
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                answer_region: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                raw_text: { type: Type.STRING }
              },
              required: ["raw_text"]
            }
          }
        });
        
        const data = JSON.parse(response.text);
        const extractedText = data.raw_text;
        
        if (target === 'model') setModelAnswer(extractedText || "");
        else setStudentAnswer(extractedText || "");
      } else {
        setError("Unsupported file type. Please upload text, image, or PDF.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to extract text from file.");
    } finally {
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  const handleRefineText = async () => {
    if (!studentAnswer) return;
    
    setIsLoading(true);
    setLoadingStage("Refining handwritten text...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          role: "user",
          parts: [{
            text: `You are an OCR correction system. Input text was extracted from a handwritten exam answer.
Fix spelling errors caused by handwriting recognition.
Correct technical terms if they appear distorted (e.g., epslon -> epsilon, algoritm -> algorithm).
Maintain the original meaning and structure.

Input Text:
${studentAnswer}

Return cleaned text only.`
          }]
        }],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });
      setStudentAnswer(response.text || studentAnswer);
    } catch (err) {
      console.error(err);
      setError("Failed to refine text.");
    } finally {
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  const handleEvaluate = async () => {
    if (!question || !rubric || !studentAnswer || !user) {
      setError("Please fill in all required fields.");
      return;
    }

    if (gradingMode === 'withModel' && !modelAnswer) {
      setError("Please provide a model answer for this grading mode.");
      return;
    }

    setIsLoading(true);
    setLoadingStage("Evaluating answer...");
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const evaluationPrompt = gradingMode === 'withModel' 
        ? `You are a strict university examiner.
Question: ${question}
Total Marks: ${totalMarks}
Rubric: ${rubric}
Model Answer: ${modelAnswer}
Student Answer: ${studentAnswer}

Tasks:
1. Identify key technical concepts from the model answer and check if they appear in the student answer.
2. Calculate a semantic similarity score (0-1) between the model and student answers.
3. Evaluate the student answer strictly against the provided rubric.
4. Provide constructive feedback.

Return JSON:
{
  "rubric_scores": { "Criterion Name": { "marks_awarded": 0, "max_marks": 0, "reason": "" } },
  "missing_concepts": [],
  "detected_concepts": [],
  "total_score": 0,
  "feedback": "",
  "semantic_similarity_score": 0.0
}`
        : `You are a strict university examiner.
Question: ${question}
Total Marks: ${totalMarks}
Rubric: ${rubric}
Student Answer: ${studentAnswer}

Tasks:
1. Identify key technical concepts required by the rubric and check if they appear in the student answer.
2. Evaluate the student answer strictly against the provided rubric.
3. Provide constructive feedback.

Return JSON:
{
  "rubric_scores": { "Criterion Name": { "marks_awarded": 0, "max_marks": 0, "reason": "" } },
  "missing_concepts": [],
  "detected_concepts": [],
  "total_score": 0,
  "feedback": "",
  "semantic_similarity_score": 0.0
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          role: "user",
          parts: [{ text: evaluationPrompt }]
        }],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rubric_scores: {
                type: Type.OBJECT,
                additionalProperties: {
                  type: Type.OBJECT,
                  properties: {
                    marks_awarded: { type: Type.NUMBER },
                    max_marks: { type: Type.NUMBER },
                    reason: { type: Type.STRING }
                  },
                  required: ["marks_awarded", "max_marks", "reason"]
                }
              },
              missing_concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
              detected_concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
              total_score: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              semantic_similarity_score: { type: Type.NUMBER }
            },
            required: ["rubric_scores", "missing_concepts", "detected_concepts", "total_score", "feedback", "semantic_similarity_score"]
          }
        }
      });

      const resultData: EvaluationResult = JSON.parse(response.text);
      setResult(resultData);

      // Save to Firestore
      await addDoc(collection(db, "evaluations"), {
        facultyId: user.uid,
        question,
        totalMarks: Number(totalMarks),
        rubric,
        modelAnswer: gradingMode === 'withModel' ? modelAnswer : "N/A (Assignment Grading Mode)",
        studentAnswer,
        result: resultData,
        gradingMode,
        createdAt: new Date().toISOString()
      });

    } catch (err) {
      console.error(err);
      setError("An error occurred during evaluation. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  const fillExample = () => {
    setQuestion("Explain DBSCAN clustering algorithm.");
    setTotalMarks("10");
    setRubric("Definition - 2 marks, Algorithm Steps - 4 marks, Advantages - 2 marks, Example - 2 marks");
    setModelAnswer("DBSCAN is a density based clustering algorithm that groups data points based on density connectivity using parameters epsilon and minPts.");
    setStudentAnswer("DBSCAN groups points that are close together and marks far points as noise. It works using epsilon distance and minimum points.");
  };

  const handleSignOut = () => signOut(auth);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <ChatBot />
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl text-indigo-400 shadow-2xl border border-white/[0.08] backdrop-blur-xl">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">ExamEval AI</h1>
              <p className="text-sm text-white/40 font-medium flex items-center gap-1.5">
                <UserIcon size={14} /> {user?.email?.split('@')[0]} | Faculty Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/[0.08] text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <History size={18} />
              {showHistory ? "Back to Grading" : "History"}
            </button>
            <button 
              onClick={fillExample}
              className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <BookOpen size={16} />
              Load Example
            </button>
            <button 
              onClick={handleSignOut}
              className="p-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all backdrop-blur-sm"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white/80">Evaluation History</h2>
                <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Last 10 Records</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {history.length === 0 ? (
                  <div className="bg-white/[0.02] backdrop-blur-xl p-12 rounded-3xl border border-dashed border-white/[0.08] text-center">
                    <History size={48} className="text-white/10 mx-auto mb-4" />
                    <p className="text-white/40">No evaluations found in your history.</p>
                  </div>
                ) : (
                  history.map((record) => (
                    <div 
                      key={record.id}
                      onClick={() => {
                        setResult(record.result);
                        setQuestion(record.question);
                        setTotalMarks(record.totalMarks.toString());
                        setShowHistory(false);
                      }}
                      className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] hover:border-indigo-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-white/80 line-clamp-1 group-hover:text-indigo-400 transition-colors">{record.question}</h3>
                          <p className="text-xs text-white/20">{new Date(record.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-400">{record.result.total_score} / {record.totalMarks}</div>
                          <div className="text-[10px] font-bold text-white/20 uppercase tracking-wider">Score</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grading"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Input Section */}
              <div className="lg:col-span-5 space-y-6">
                <section className="bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/[0.08] p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <LayoutDashboard size={18} className="text-indigo-400" />
                    </div>
                    <h2 className="font-semibold text-white/80">Exam Configuration</h2>
                  </div>

                  {/* Grading Mode Toggle */}
                  <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                    <button
                      onClick={() => setGradingMode('withModel')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                        gradingMode === 'withModel' 
                          ? "bg-indigo-600 text-white shadow-lg" 
                          : "text-white/40 hover:text-white/60"
                      )}
                    >
                      <FileText size={14} />
                      With Model
                    </button>
                    <button
                      onClick={() => setGradingMode('assignmentGrading')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                        gradingMode === 'assignmentGrading' 
                          ? "bg-indigo-600 text-white shadow-lg" 
                          : "text-white/40 hover:text-white/60"
                      )}
                    >
                      <ClipboardCheck size={14} />
                      Assignment Grading
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Question</label>
                      <textarea 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter the question here..."
                        className="w-full p-4 bg-white/5 border border-white/[0.08] rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all min-h-[100px] text-sm text-white placeholder:text-white/10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Total Marks</label>
                        <input 
                          type="number"
                          value={totalMarks}
                          onChange={(e) => setTotalMarks(e.target.value)}
                          className="w-full p-4 bg-white/5 border border-white/[0.08] rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm text-white placeholder:text-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Rubric Logic</label>
                        <input 
                          type="text"
                          value={rubric}
                          onChange={(e) => setRubric(e.target.value)}
                          placeholder="e.g. Definition: 2, Steps: 4..."
                          className="w-full p-4 bg-white/5 border border-white/[0.08] rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm text-white placeholder:text-white/10"
                        />
                      </div>
                    </div>

                    {gradingMode === 'withModel' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Model Answer</label>
                          <button 
                            onClick={() => modelFileRef.current?.click()}
                            className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors"
                          >
                            <Upload size={12} /> Upload Doc
                          </button>
                          <input 
                            type="file" 
                            ref={modelFileRef} 
                            className="hidden" 
                            accept=".txt,.pdf,.png,.jpg,.jpeg"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'model')}
                          />
                        </div>
                        <textarea 
                          value={modelAnswer}
                          onChange={(e) => setModelAnswer(e.target.value)}
                          placeholder="The ideal answer for full marks..."
                          className="w-full p-4 bg-white/5 border border-white/[0.08] rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all min-h-[100px] text-sm text-white placeholder:text-white/10"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Student Answer</label>
                          {studentAnswer && (
                            <button
                              onClick={handleRefineText}
                              disabled={isLoading}
                              className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors"
                            >
                              <Sparkles size={12} /> Refine Text
                            </button>
                          )}
                        </div>
                        <button 
                          onClick={() => studentFileRef.current?.click()}
                          className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors"
                        >
                          <FileUp size={12} /> Upload Answer Sheet
                        </button>
                        <input 
                          type="file" 
                          ref={studentFileRef} 
                          className="hidden" 
                          accept=".txt,.pdf,.png,.jpg,.jpeg"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'student')}
                        />
                      </div>
                      <textarea 
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        placeholder="The answer to be evaluated..."
                        className="w-full p-4 bg-white/5 border border-white/[0.08] rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all min-h-[120px] text-sm text-white placeholder:text-white/10"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleEvaluate}
                    disabled={isLoading}
                    className="w-full py-4 bg-white text-black hover:bg-slate-100 disabled:bg-white/10 disabled:text-white/20 rounded-2xl font-bold shadow-2xl transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <ClipboardCheck size={20} />
                        Grade Answer
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                </section>
              </div>

              {/* Results Section */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {!result && !isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-dashed border-white/[0.08]"
                    >
                      <div className="p-6 bg-white/5 rounded-3xl mb-6 border border-white/[0.08]">
                        <FileText size={48} className="text-white/10" />
                      </div>
                      <h3 className="text-lg font-semibold text-white/60">Ready for Evaluation</h3>
                      <p className="text-white/30 max-w-xs mt-2">Fill in the exam details or upload documents to generate a detailed rubric-based score.</p>
                    </motion.div>
                  )}

                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/[0.08]"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <GraduationCap size={32} className="text-indigo-400" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white/80 mt-8">{loadingStage}</h3>
                      <p className="text-white/30 max-w-xs mt-2 italic">Processing multi-stage semantic analysis...</p>
                    </motion.div>
                  )}

                  {result && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      {/* Score Card */}
                      <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/[0.08] overflow-hidden">
                        <div className="bg-indigo-500/10 p-8 text-white flex items-center justify-between border-b border-white/[0.08]">
                          <div>
                            <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Final Evaluation</h3>
                            <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">{result.total_score}</span>
                              <span className="text-white/20 text-xl">/ {totalMarks}</span>
                            </div>
                          </div>
                          <div className="text-right space-y-3">
                            <div className="inline-flex items-center px-4 py-1.5 bg-white/5 border border-white/[0.08] rounded-full text-xs font-bold text-indigo-400 backdrop-blur-sm">
                              {((result.total_score / Number(totalMarks)) * 100).toFixed(0)}% Accuracy
                            </div>
                            <div className="block text-[10px] font-bold uppercase tracking-widest text-white/20">
                              Semantic Alignment: {(result.semantic_similarity_score * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-8">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-6 flex items-center gap-2">
                            <Target size={14} />
                            Rubric Breakdown
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(result.rubric_scores).map(([criterion, score], idx) => {
                              const s = score as RubricScore;
                              return (
                                <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/[0.08] hover:border-indigo-500/30 transition-all">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold capitalize text-white/80">{criterion.replace(/_/g, ' ')}</span>
                                    <span className="text-sm font-mono font-bold text-indigo-400">
                                      {s.marks_awarded} / {s.max_marks}
                                    </span>
                                  </div>
                                  <p className="text-sm text-white/40 leading-relaxed">{s.reason}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Concepts & Feedback */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/[0.08] p-8">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-6 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400/60" />
                            Detected Concepts
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.detected_concepts.map((concept, i) => (
                              <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/[0.08] p-8">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-6 flex items-center gap-2">
                            <XCircle size={14} className="text-rose-400/60" />
                            Missing Concepts
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.missing_concepts.length > 0 ? (
                              result.missing_concepts.map((concept, i) => (
                                <span key={i} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                  {concept}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-white/20 italic">None detected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/[0.08] p-8">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                          <MessageSquare size={14} />
                          Examiner Feedback
                        </h4>
                        <p className="text-white/70 italic leading-relaxed border-l-2 border-indigo-500/30 pl-4 py-1">
                          "{result.feedback}"
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
