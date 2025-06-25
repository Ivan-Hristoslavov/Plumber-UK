export default function FooterMain() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            © {new Date().getFullYear()} Fix my leak. All rights reserved.
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Developed by{" "}
            <a
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              href="https://serenity.rapid-frame.co.uk/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Serenity Web Studio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
