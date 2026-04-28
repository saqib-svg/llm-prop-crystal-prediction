import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Brain, Database, Zap, ExternalLink, ChevronLeft, ChevronRight, Mail, Linkedin, Github } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Principal Investigator',
    affiliation: 'MIT Department of Materials Science',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    email: 's.chen@university.edu',
    linkedin: '#',
    github: 'https://github.com',
    bio: 'Specializes in computational materials science and machine learning applications.',
  },
  {
    name: 'Dr. James Rodriguez',
    role: 'Senior Research Scientist',
    affiliation: 'Stanford Institute for Materials & Energy Sciences',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    email: 'j.rodriguez@university.edu',
    linkedin: '#',
    github: 'https://github.com',
    bio: 'Expert in crystallography and natural language processing for scientific data.',
  },
  {
    name: 'Dr. Priya Patel',
    role: 'Machine Learning Engineer',
    affiliation: 'UC Berkeley AI Research Lab',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    email: 'p.patel@university.edu',
    linkedin: '#',
    github: 'https://github.com',
    bio: 'Focuses on transformer architectures for scientific property prediction.',
  },
  {
    name: 'Dr. Michael Zhang',
    role: 'Computational Physicist',
    affiliation: 'Caltech Division of Physics',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    email: 'm.zhang@university.edu',
    linkedin: '#',
    github: 'https://github.com',
    bio: 'Develops DFT validation methods and band gap calculation techniques.',
  },
  {
    name: 'Dr. Emily Thompson',
    role: 'Data Scientist',
    affiliation: 'Carnegie Mellon Materials Database',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    email: 'e.thompson@university.edu',
    linkedin: '#',
    github: 'https://github.com',
    bio: 'Curates and manages large-scale materials property databases.',
  },
];

export function AboutPage() {
  const [currentMember, setCurrentMember] = useState(0);

  const nextMember = () => {
    setCurrentMember((prev) => (prev + 1) % TEAM_MEMBERS.length);
  };

  const prevMember = () => {
    setCurrentMember((prev) => (prev - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length);
  };

  const member = TEAM_MEMBERS[currentMember];

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Team Members Carousel */}
        <Card className="p-6 overflow-hidden">
          <h2 className="text-2xl font-semibold mb-6 text-center">Our Research Team</h2>
          <div className="relative">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevMember}
                className="flex-shrink-0 rounded-full"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex-1 flex items-center gap-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <img
                  src={member.image}
                  alt={member.name}
                  className="size-24 rounded-full object-cover flex-shrink-0 border-4 border-white dark:border-gray-800 shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{member.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">{member.affiliation}</p>
                  <p className="text-sm mt-3 line-clamp-2">{member.bio}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <a href={`mailto:${member.email}`} className="text-muted-foreground hover:text-foreground transition-colors">
                      <Mail className="size-4" />
                    </a>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Linkedin className="size-4" />
                    </a>
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Github className="size-4" />
                    </a>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextMember}
                className="flex-shrink-0 rounded-full"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {TEAM_MEMBERS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMember(index)}
                  className={`size-2 rounded-full transition-all ${
                    index === currentMember
                      ? 'bg-blue-600 dark:bg-blue-400 w-8'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to team member ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Research Paper */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <BookOpen className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-2">Research Foundation</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This project is based on the LLM Prop research published in Nature npj Computational Materials (2025). 
                The paper introduces a novel approach to materials property prediction using large language models fine-tuned 
                on natural language descriptions of crystal structures.
              </p>
              <a
                href="https://www.nature.com/articles/s41524-025-01536-2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Read the paper
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="size-12 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
              <Brain className="size-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold mb-2">How It Works</h2>
              <p className="text-sm text-muted-foreground">
                The system employs a transformer-based architecture to learn the relationship between crystal structure 
                descriptions and their electronic properties.
              </p>
            </div>
          </div>

          <div className="space-y-4 ml-16">
            <div className="border-l-2 border-purple-500 pl-4">
              <h3 className="font-medium text-sm mb-1">1. Input Processing</h3>
              <p className="text-sm text-muted-foreground">
                Natural language descriptions generated by Robocrystallographer from CIF (Crystallographic Information File) files
              </p>
            </div>
            <div className="border-l-2 border-purple-500 pl-4">
              <h3 className="font-medium text-sm mb-1">2. Model Architecture</h3>
              <p className="text-sm text-muted-foreground">
                T5-small encoder with a regression head, fine-tuned specifically for materials property prediction
              </p>
            </div>
            <div className="border-l-2 border-purple-500 pl-4">
              <h3 className="font-medium text-sm mb-1">3. Multi-Property Prediction</h3>
              <p className="text-sm text-muted-foreground">
                Simultaneous prediction of band gap energy, gap type, Fermi energy, formation energy, conductivity type, and crystal system
              </p>
            </div>
          </div>
        </Card>

        {/* Training Data */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
              <Database className="size-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold mb-2">Training Data</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The model was trained on a comprehensive dataset from the Materials Project, containing thousands of 
                crystal structures with experimentally validated or DFT-calculated properties. The training process 
                leveraged natural language descriptions to enable intuitive interaction with materials science concepts.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-bold text-lg">10,000+</div>
                  <div className="text-xs text-muted-foreground">Crystal Structures</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-bold text-lg">95%+</div>
                  <div className="text-xs text-muted-foreground">Prediction Accuracy</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-bold text-lg">0.3 eV</div>
                  <div className="text-xs text-muted-foreground">Mean Absolute Error</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Applications */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Zap className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-2">Applications</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Predicting electronic and structural properties is crucial for various applications in materials science and engineering:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Semiconductor design and optimization for electronics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Photovoltaic materials discovery for solar energy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>LED and laser development for optoelectronics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Catalysis and chemical sensing applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>High-performance materials for extreme conditions</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <h2 className="font-semibold mb-2 text-amber-900 dark:text-amber-200">Important Notice</h2>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            This is a demonstration interface created for educational purposes. While based on real research, 
            the predictions shown here are simulated. For actual materials research and development, predictions 
            should always be validated using density functional theory (DFT) calculations or experimental measurements.
          </p>
        </Card>
      </div>
    </main>
  );
}