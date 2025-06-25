export default function FooterMain() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Fix my leak. All rights reserved.
          </div>
          <div className="text-sm text-gray-500">
            Designed by{" "}
            <a
              className="text-primary hover:text-primary-dark transition-colors"
              href="https://google.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Serenity
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
