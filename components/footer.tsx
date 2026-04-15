"use client";
import React from "react";
import Container from "./container";
import { LinkPreview } from "./link-preview";

export const Footer = () => {
  return (
    <Container className="mt-auto pb-10">
      <footer className="my-8 flex flex-col items-center gap-4">
        <img
          src="/amit-kumar.svg"
          alt="Amit Kumar signature"
          className="mx-auto h-8 w-auto"
        />
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-foreground/40 text-center text-sm text-balance">
            Built in public by an indie hacker. Here&apos;s the{" "}
            <LinkPreview url="https://github.com/ravenrepo">code</LinkPreview>{" "}
            and{" "}
            <LinkPreview url="https://substack.com/@growthperclick">
              launch notes
            </LinkPreview>{" "}
            behind product decisions.
          </div>
          <p className="text-foreground/40 text-sm text-balance">
            Shipping products fast, testing demand, and compounding
            distribution.
          </p>
        </div>
      </footer>
    </Container>
  );
};
