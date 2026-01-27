import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Calendar, Bell, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Events = () => {
  useScrollToTop();

  // Placeholder for future events
  const upcomingEvents: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Events & Workshops
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with our upcoming workshops, webinars, and learning events
            </p>
          </div>

          {upcomingEvents.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">No Events Scheduled Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We're planning exciting workshops and events. Check back soon or browse our courses to start learning today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link to="/courses">Browse Courses</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/register">
                      <Bell className="h-4 w-4 mr-2" />
                      Get Notified
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-primary to-accent" />
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Upcoming Features Teaser */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Live Webinars</h4>
              <p className="text-sm text-muted-foreground">
                Interactive online sessions with industry experts
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <h4 className="font-semibold mb-2">In-Person Workshops</h4>
              <p className="text-sm text-muted-foreground">
                Hands-on training sessions at our locations
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-secondary" />
              </div>
              <h4 className="font-semibold mb-2">Networking Events</h4>
              <p className="text-sm text-muted-foreground">
                Connect with peers and industry professionals
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
