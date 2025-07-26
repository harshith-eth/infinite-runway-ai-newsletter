import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'fs';
import path from 'path';
import { NewsletterLayout } from '../../../components/NewsletterLayout';

// This component renders the ai-mirror newsletter
export default async function AiMirrorPage() {
  try {
    // Load metadata
    const metadataPath = path.join(process.cwd(), 'frontend/app/essays/2025/august/week-1/ai-mirror/metadata.json');
    const contentPath = path.join(process.cwd(), 'frontend/app/essays/2025/august/week-1/ai-mirror/page.mdx');
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const content = fs.readFileSync(contentPath, 'utf8');

    return (
      <NewsletterLayout metadata={metadata}>
        <MDXRemote source={content} />
      </NewsletterLayout>
    );
  } catch (error) {
    console.error('Error loading newsletter:', error);
    notFound();
  }
} 