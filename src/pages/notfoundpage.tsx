import { Link } from "react-router-dom";

import { CompassStarIcon } from "../assets/icons";
import { Container } from "../components/layout";
import { Button } from "../components/ui";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
      <Container size="sm" className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            <CompassStarIcon size={36} className="text-primary-500" />
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-3">
          404
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-900">
          That page has wandered off
        </h1>
        <p className="mt-3 text-primary-500 max-w-md mx-auto">
          The link you followed doesn"t lead anywhere. Try the library, or head
          back home.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="lg">Back home</Button>
          </Link>
          <Link to="/library">
            <Button variant="secondary" size="lg">Browse library</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
