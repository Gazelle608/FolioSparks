import React from 'react';
import { Link } from 'react-router-dom';
import { IconBook, IconSparks, IconArrowRight } from '../../../types/icons';
import { Button } from '../../common/Button';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-green text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-300 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-spark-gradient rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-6xl px-4 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-700/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <IconSparks size={18} color="#F4A460" />
              <span className="text-sm text-primary-200">Serialized fiction that pays</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              Stories worth staying up for.
              <br />
              <span className="text-accent-300">Authors who actually get paid.</span>
            </h1>

            <p className="text-lg lg:text-xl text-primary-200 mb-8 max-w-2xl mx-auto lg:mx-0">
              FolioSparks is a digital library for serialized novels. Readers spend Sparks
              on the chapters that hit hardest, vote on what happens next, and donate
              straight to the author's own platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-primary-900 hover:bg-primary-50">
                  Start Reading Free
                  <IconArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Link to="/library">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <IconBook size={20} className="mr-2" />
                  Explore Library
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-primary-200 justify-center lg:justify-start">
              <span className="flex items-center gap-2">
                <IconSparks size={16} color="#F4A460" />
                <span>100+ free Sparks monthly</span>
              </span>
              <span className="w-px h-4 bg-primary-500" />
              <span>10,000+ stories</span>
              <span className="w-px h-4 bg-primary-500" />
              <span>500+ authors</span>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-light rounded-2xl opacity-20 blur-2xl" />
              <div className="relative bg-primary-700/50 backdrop-blur-sm rounded-2xl p-8 h-full flex flex-col items-center justify-center border border-primary-600">
                <IconBook size={80} color="#DAF1DE" />
                <p className="text-center text-primary-200 mt-4">
                  "The best place to discover<br />serialized fiction"
                </p>
                <div className="flex items-center gap-1 mt-4">
                  <span className="w-2 h-2 bg-spark-gradient rounded-full" />
                  <span className="w-2 h-2 bg-spark-gradient rounded-full" />
                  <span className="w-2 h-2 bg-spark-gradient rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};