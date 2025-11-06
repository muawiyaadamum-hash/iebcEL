import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">MTech Academy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering learners with professional online courses in technology, business, and more.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Course Categories</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Technology</li>
              <li className="text-sm text-muted-foreground">Human Resources</li>
              <li className="text-sm text-muted-foreground">Business</li>
              <li className="text-sm text-muted-foreground">Logistics</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Bamenda, Cameroon</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+237 XXX XXX XXX</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@mtechacademy.cm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MTech Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
